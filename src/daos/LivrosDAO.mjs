import Livros from "../objetos/Livros.mjs";

export default class LivrosDAO {
  constructor() {
    this.chaveLivros = "livros";
  }

  // 🔹 Carrega livros do localStorage
  carregarLivros() {
    try {
      const livrosJSON = localStorage.getItem(this.chaveLivros);
      return Promise.resolve(livrosJSON ? JSON.parse(livrosJSON) : []);
    } catch (e) {
      console.error("Erro ao carregar livros do localStorage:", e);
      return Promise.resolve([]);
    }
  }

  // 🔹 Carrega do backend fake (se estiver usando)
  async carregarLivrosBackendFake() {
    try {
      const response = await fetch("http://localhost:5000/livros");
      const livrosJSON = await response.json();
      return livrosJSON;
    } catch (error) {
      console.error("Erro ao carregar do backend fake:", error);
      return [];
    }
  }

  // 🔥 Gera um ISBN automaticamente
  gerarISBN() {
    // Exemplo: "ISBN-3ks9d82kf0S"
    return (
      "ISBN-" +
      Date.now().toString(36) +
      Math.random().toString(36).substring(2, 8)
    );
  }

  // 🔹 Converte o objeto Livros para JSON salvo
  arrumarLivros(livrosObj) {
    console.log(livrosObj);
    if (!livrosObj) return null;

    return {
      id: livrosObj.getLivroId() || Date.now(), // ID interno do livro
      titulo: livrosObj.getTitulo() || "",
      ano: livrosObj.getAno() || "",
      isbn: livrosObj.getISBN() || this.gerarISBN(), // usa ISBN gerado aqui
      categoria: livrosObj.getCategoria() || "",
      autorId: livrosObj.getAutorId() || null, // FK para Autores
    };
  }

  // 🔹 Salvar um novo livro
  async salvarLivros(livros) {
    console.log(livros);
    try {
      const lista = await this.carregarLivros();
      if (lista.find((l) => l.titulo === livros.getTitulo())) {
        console.error("Título já existe!");
        return false;
      }
      if(lista.find((l) => l.isbn === livros.getISBN())) {
        console.error("ISBN já existe!");
        return false;
      }
      const livroObj = this.arrumarLivros(livros);

      if (!livroObj) {
        console.error("Dados do livro inválidos");
        return false;
      }

      lista.push(livroObj);
      localStorage.setItem(this.chaveLivros, JSON.stringify(lista));
      return true;
    } catch (e) {
      console.error("Erro ao salvar livros no localStorage:", e);
      return false;
    }
  }

  // 🔹 Atualizar livro existente
  async atualizarLivros(id, livro) {
    try {
      if (!id || !livro) {
        console.error("ID ou livro não fornecido");
        return false;
      }

      const lista = await this.carregarLivros();
      const index = lista.findIndex((l) => l.id === id);

      if (index === -1) {
        console.error("Livro não encontrado para atualização");
        return false;
      }

      const livroAtualizado = {
        ...lista[index],
        ...this.arrumarLivros(livro),
        id: id, // mantém ID original sempre
        isbn: lista[index].isbn, // ISBN NÃO muda na atualização
      };

      lista[index] = livroAtualizado;
      localStorage.setItem(this.chaveLivros, JSON.stringify(lista));
      return true;
    } catch (e) {
      console.error("Erro ao atualizar livros:", e);
      return false;
    }
  }

  // 🔹 Excluir livro por ID
  async excluirLivro(id) {
    try {
      if (!id) {
        console.error("ID não fornecido");
        return false;
      }

      const lista = await this.carregarLivros();
      const novaLista = lista.filter((l) => l.id !== id);

      if (novaLista.length === lista.length) {
        console.error("Livro não encontrado para exclusão");
        return false;
      }

      localStorage.setItem(this.chaveLivros, JSON.stringify(novaLista));
      return true;
    } catch (e) {
      console.error("Erro ao excluir livro:", e);
      return false;
    }
  }

  // Compatibilidade
  async deletarLivro(id) {
    return this.excluirLivro(id);
  }
}
