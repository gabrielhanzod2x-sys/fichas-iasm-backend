# Backend IASM Fichas - MongoDB

API REST para gerenciar fichas de beneficiários do IASM com MongoDB Atlas.

## 🚀 Setup Rápido

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/fichas-iasm-backend.git
cd fichas-iasm-backend
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar `.env`
Crie um arquivo `.env` na raiz com:
```
MONGODB_URI=mongodb+srv://Gabrielluiz:iasm2026@iasm-cluster.wrhrt7x.mongodb.net/?appName=iasm-cluster
PORT=3000
NODE_ENV=production
```

### 4. Rodar localmente
```bash
npm run dev
```

A API estará em `http://localhost:3000`

---

## 📡 Endpoints da API

### Status
- **GET** `/api/status` - Verifica se API tá online

### Fichas (CRUD)
- **POST** `/api/fichas` - Criar nova ficha
- **GET** `/api/fichas` - Listar todas (com paginação)
- **GET** `/api/fichas/:id` - Buscar por ID
- **GET** `/api/fichas/buscar/:orgao/:matricula` - Buscar por órgão + matrícula
- **GET** `/api/fichas/nome/:nome` - Buscar por nome
- **GET** `/api/fichas-por-orgao/:orgao` - Listar fichas de um órgão
- **PUT** `/api/fichas/:id` - Atualizar ficha
- **DELETE** `/api/fichas/:id` - Deletar ficha

### Dependentes
- **POST** `/api/fichas/:id/dependentes` - Adicionar dependente
- **DELETE** `/api/fichas/:id/dependentes/:indice` - Remover dependente

### Estatísticas
- **GET** `/api/stats` - Estatísticas gerais (total, por órgão)

---

## 📝 Exemplo de uso (JSON)

### Criar ficha
```bash
POST /api/fichas
Content-Type: application/json

{
  "orgao": "PREFEITURA",
  "matricula": "12345",
  "nome": "João Silva",
  "cpf": "123.456.789-00",
  "nascimento": "15/05/1980",
  "idade": "44",
  "sexo": "M",
  "estadoCivil": "Casado",
  "endereco": "Rua A",
  "numero": "100",
  "cidade": "Poços de Caldas",
  "cep": "37701-000",
  "dependentes": []
}
```

### Adicionar dependente
```bash
POST /api/fichas/{id}/dependentes
Content-Type: application/json

{
  "nome": "Maria Silva",
  "cpf": "987.654.321-00",
  "parentesco": "01 - Esposa",
  "nascimento": "20/08/1982",
  "idade": "42",
  "sexo": "F"
}
```

---

## 🚀 Deploy no Render

### 1. Push pro GitHub
```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 2. No Render
- Ir em https://render.com
- Clique em **"New +"** → **"Web Service"**
- Conecte seu repositório GitHub
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- Adicione as variáveis de ambiente (`.env`)
- Deploy!

---

## 📚 Estrutura de Dados

```javascript
{
  _id: ObjectId,
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
  dependentes: [
    {
      nome: String,
      cpf: String,
      parentesco: String,
      nascimento: String,
      idade: String,
      sexo: String
    }
  ],
  criadoEm: Date,
  atualizadoEm: Date
}
```

---

## 🔧 Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `MONGODB_URI` | Sim | String de conexão do MongoDB Atlas |
| `PORT` | Não | Porta do servidor (padrão: 3000) |
| `NODE_ENV` | Não | production ou development |

---

## 📞 Contato & Suporte

Desenvolvido por: Gabriel Luiz Vieira Lemos
IASM - Instituto de Assistência dos Servidores Municipais
