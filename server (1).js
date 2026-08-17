require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// ============================================
// SCHEMA FICHA
// ============================================

const dependenteSchema = new mongoose.Schema({
  nome: String,
  cpf: String,
  parentesco: String,
  nascimento: String,
  idade: String,
  sexo: String
});

const fichaSchema = new mongoose.Schema({
  orgao: String,
  matricula: String,
  nome: String,
  filiacao: String,
  endereco: String,
  numero: String,
  cidade: String,
  cep: String,
  cpf: String,
  nascimento: String,
  idade: String,
  sexo: String,
  estadoCivil: String,
  ctps: String,
  rg: String,
  dataAdmissao: String,
  pis: String,
  funcao: String,
  lotacao: String,
  dependentes: [dependenteSchema],
  criadoEm: { type: Date, default: Date.now },
  atualizadoEm: { type: Date, default: Date.now }
});

const Ficha = mongoose.model('Ficha', fichaSchema);

// ============================================
// SCHEMA LOG (histórico de fichas adicionadas/excluídas)
// ============================================

const logSchema = new mongoose.Schema({
  tipo: String, // 'adicionada' ou 'excluida'
  nome: String,
  matricula: String,
  orgao: String,
  fichaSnapshot: Object, // cópia completa da ficha (usada pra restaurar se excluída)
  restaurada: { type: Boolean, default: false },
  data: { type: Date, default: Date.now }
});

const Log = mongoose.model('Log', logSchema);

// ============================================
// CONEXÃO MONGODB
// ============================================

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado!'))
  .catch(err => console.error('❌ Erro ao conectar MongoDB:', err));

// ============================================
// ROTAS
// ============================================

// 1️⃣ CRIAR nova ficha
app.post('/api/fichas', async (req, res) => {
  try {
    const novaFicha = new Ficha(req.body);
    await novaFicha.save();

    // Registrar no log
    try {
      await new Log({
        tipo: 'adicionada',
        nome: novaFicha.nome,
        matricula: novaFicha.matricula,
        orgao: novaFicha.orgao,
        fichaSnapshot: novaFicha.toObject()
      }).save();
    } catch (logErr) {
      console.error('Aviso: erro ao salvar log:', logErr.message);
    }

    res.status(201).json({ 
      sucesso: true, 
      mensagem: 'Ficha criada com sucesso!',
      ficha: novaFicha 
    });
  } catch (err) {
    res.status(400).json({ 
      sucesso: false, 
      erro: err.message 
    });
  }
});

// 2️⃣ BUSCAR todas as fichas (com paginação)
app.get('/api/fichas', async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 50;
    const skip = (pagina - 1) * limite;

    const fichas = await Ficha.find()
      .skip(skip)
      .limit(limite)
      .sort({ criadoEm: -1 });

    const total = await Ficha.countDocuments();

    res.json({
      sucesso: true,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
      fichas
    });
  } catch (err) {
    res.status(500).json({ 
      sucesso: false, 
      erro: err.message 
    });
  }
});

// 3️⃣ BUSCAR ficha por ID
app.get('/api/fichas/:id', async (req, res) => {
  try {
    const ficha = await Ficha.findById(req.params.id);
    if (!ficha) {
      return res.status(404).json({ 
        sucesso: false, 
        erro: 'Ficha não encontrada' 
      });
    }
    res.json({ sucesso: true, ficha });
  } catch (err) {
    res.status(500).json({ 
      sucesso: false, 
      erro: err.message 
    });
  }
});

// 4️⃣ BUSCAR por matrícula e órgão
app.get('/api/fichas/buscar/:orgao/:matricula', async (req, res) => {
  try {
    const ficha = await Ficha.findOne({
      orgao: req.params.orgao,
      matricula: req.params.matricula
    });
    
    if (!ficha) {
      return res.status(404).json({ 
        sucesso: false, 
        erro: 'Ficha não encontrada' 
      });
    }
    res.json({ sucesso: true, ficha });
  } catch (err) {
    res.status(500).json({ 
      sucesso: false, 
      erro: err.message 
    });
  }
});

// 5️⃣ BUSCAR por nome (texto)
app.get('/api/fichas/nome/:nome', async (req, res) => {
  try {
    const fichas = await Ficha.find({
      nome: { $regex: req.params.nome, $options: 'i' }
    }).limit(50);

    res.json({ 
      sucesso: true, 
      total: fichas.length, 
      fichas 
    });
  } catch (err) {
    res.status(500).json({ 
      sucesso: false, 
      erro: err.message 
    });
  }
});

// 6️⃣ BUSCAR por órgão
app.get('/api/fichas-por-orgao/:orgao', async (req, res) => {
  try {
    const fichas = await Ficha.find({ orgao: req.params.orgao })
      .sort({ nome: 1 });

    res.json({ 
      sucesso: true, 
      total: fichas.length, 
      orgao: req.params.orgao,
      fichas 
    });
  } catch (err) {
    res.status(500).json({ 
      sucesso: false, 
      erro: err.message 
    });
  }
});

// 7️⃣ ATUALIZAR ficha
app.put('/api/fichas/:id', async (req, res) => {
  try {
    const ficha = await Ficha.findByIdAndUpdate(
      req.params.id,
      { ...req.body, atualizadoEm: new Date() },
      { new: true }
    );
    
    if (!ficha) {
      return res.status(404).json({ 
        sucesso: false, 
        erro: 'Ficha não encontrada' 
      });
    }
    
    res.json({ 
      sucesso: true, 
      mensagem: 'Ficha atualizada com sucesso!',
      ficha 
    });
  } catch (err) {
    res.status(400).json({ 
      sucesso: false, 
      erro: err.message 
    });
  }
});

// 8️⃣ DELETAR ficha
app.delete('/api/fichas/:id', async (req, res) => {
  try {
    const ficha = await Ficha.findByIdAndDelete(req.params.id);
    
    if (!ficha) {
      return res.status(404).json({ 
        sucesso: false, 
        erro: 'Ficha não encontrada' 
      });
    }

    // Registrar no log (com snapshot completo pra poder restaurar depois)
    try {
      await new Log({
        tipo: 'excluida',
        nome: ficha.nome,
        matricula: ficha.matricula,
        orgao: ficha.orgao,
        fichaSnapshot: ficha.toObject()
      }).save();
    } catch (logErr) {
      console.error('Aviso: erro ao salvar log:', logErr.message);
    }
    
    res.json({ 
      sucesso: true, 
      mensagem: 'Ficha deletada com sucesso!' 
    });
  } catch (err) {
    res.status(500).json({ 
      sucesso: false, 
      erro: err.message 
    });
  }
});

// ============================================
// ROTAS DE LOG (histórico de fichas)
// ============================================

// Listar logs (mais recentes primeiro)
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await Log.find().sort({ data: -1 }).limit(500);
    res.json({ sucesso: true, total: logs.length, logs });
  } catch (err) {
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

// Restaurar ficha excluída a partir de um log
app.post('/api/logs/:id/restaurar', async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);

    if (!log) {
      return res.status(404).json({ sucesso: false, erro: 'Log não encontrado' });
    }
    if (log.tipo !== 'excluida') {
      return res.status(400).json({ sucesso: false, erro: 'Este registro não é de uma ficha excluída' });
    }
    if (log.restaurada) {
      return res.status(400).json({ sucesso: false, erro: 'Esta ficha já foi restaurada' });
    }

    // Recriar a ficha a partir do snapshot
    const dadosFicha = { ...log.fichaSnapshot };
    delete dadosFicha._id;
    delete dadosFicha.__v;

    const fichaRestaurada = new Ficha(dadosFicha);
    await fichaRestaurada.save();

    log.restaurada = true;
    await log.save();

    // Registrar log de restauração
    await new Log({
      tipo: 'adicionada',
      nome: fichaRestaurada.nome,
      matricula: fichaRestaurada.matricula,
      orgao: fichaRestaurada.orgao,
      fichaSnapshot: fichaRestaurada.toObject()
    }).save();

    res.json({
      sucesso: true,
      mensagem: 'Ficha restaurada com sucesso!',
      ficha: fichaRestaurada
    });
  } catch (err) {
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

// 9️⃣ ADICIONAR dependente a uma ficha
app.post('/api/fichas/:id/dependentes', async (req, res) => {
  try {
    const ficha = await Ficha.findById(req.params.id);
    
    if (!ficha) {
      return res.status(404).json({ 
        sucesso: false, 
        erro: 'Ficha não encontrada' 
      });
    }
    
    ficha.dependentes.push(req.body);
    ficha.atualizadoEm = new Date();
    await ficha.save();
    
    res.status(201).json({ 
      sucesso: true, 
      mensagem: 'Dependente adicionado com sucesso!',
      ficha 
    });
  } catch (err) {
    res.status(400).json({ 
      sucesso: false, 
      erro: err.message 
    });
  }
});

// 🔟 DELETAR dependente
app.delete('/api/fichas/:id/dependentes/:indice', async (req, res) => {
  try {
    const ficha = await Ficha.findById(req.params.id);
    
    if (!ficha) {
      return res.status(404).json({ 
        sucesso: false, 
        erro: 'Ficha não encontrada' 
      });
    }
    
    ficha.dependentes.splice(req.params.indice, 1);
    ficha.atualizadoEm = new Date();
    await ficha.save();
    
    res.json({ 
      sucesso: true, 
      mensagem: 'Dependente removido com sucesso!',
      ficha 
    });
  } catch (err) {
    res.status(500).json({ 
      sucesso: false, 
      erro: err.message 
    });
  }
});

// 1️⃣1️⃣ ESTATÍSTICAS GERAIS
app.get('/api/stats', async (req, res) => {
  try {
    const totalFichas = await Ficha.countDocuments();
    const fichasComDependentes = await Ficha.countDocuments({ 
      "dependentes.0": { $exists: true } 
    });
    
    const result = await Ficha.aggregate([
      {
        $group: {
          _id: '$orgao',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      sucesso: true,
      totalFichas,
      fichasComDependentes,
      porOrgao: result
    });
  } catch (err) {
    res.status(500).json({ 
      sucesso: false, 
      erro: err.message 
    });
  }
});

// Status da API
app.get('/api/status', (req, res) => {
  res.json({ 
    sucesso: true, 
    mensagem: 'API IASM Fichas rodando! 🚀',
    timestamp: new Date()
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Status: GET http://localhost:${PORT}/api/status`);
});
