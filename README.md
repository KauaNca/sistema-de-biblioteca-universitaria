# 📚 Sistema de Biblioteca Universitária  
### (React + Tailwind + Ant Design + JavaScript)

Este projeto consiste no desenvolvimento de um **sistema web completo** para gerenciamento de uma Biblioteca Universitária, incluindo CRUDs de Livros, Autores e Alunos, além de um relatório de livros emprestados por aluno.

---

## 🚀 Tecnologias Utilizadas

### **Frontend**
- React  
- JavaScript (ESM)  
- TailwindCSS  
- Ant Design (antd)  
- LocalStorage ou Fetch API (para persistência)

### **Backend (Opcional)**
- Node.js + Express  
- MongoDB + Mongoose  
- Rotas REST

---

## 📁 Estrutura de Pastas
```txt
📦 projeto
┣ 📂 frontend
│ ┣ 📂 src
│ │ ┣ 📂 components # Componentes reutilizáveis
│ │ ┣ 📂 pages # Páginas principais (Livros, Autores, Alunos, Relatórios)
│ │ ┣ 📂 daos # Data Access Objects → LocalStorage ou fetch()
│ │ ┣ 📂 models # Classes/Interfaces de Livro, Autor e Aluno
│ │ ┗ App.jsx # Roteamento e layout principal
┗ 📂 backend (opcional)
┣ 📂 models # Schemas Mongoose
┣ 📂 daos # Acesso ao banco via Mongoose
┣ 📂 controllers # Lógica e regras de negócio
┣ 📂 routes # Rotas da API REST
┗ server.js # Servidor Express
```
---

## 🎯 Objetivo do Projeto

Este projeto permite praticar:

- Organização modular usando **React**
- Componentização com **TailwindCSS** + **Ant Design**
- Implementação de **CRUD completo** no frontend
- Persistência simples utilizando **LocalStorage**
- Criação de um **backend opcional** com MongoDB e Mongoose
- Manipulação de **relacionamentos entre entidades**
- Geração de **relatórios combinando múltiplas fontes de dados**
