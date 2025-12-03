import Autores from "../objetos/Autores.mjs";

export default class AutoresDAO {
  constructor() {
    this.chaveAutor = "autores";
  }

  carregarAutores() {
    try {
      const autoresJSON = localStorage.getItem(this.chaveAutor);
      return Promise.resolve(autoresJSON ? JSON.parse(autoresJSON) : []);
    } catch (e) {
      console.error("Erro ao carregar autores do localStorage:", e);
      return Promise.resolve([]);
    }
  }

  async carregarAutoresBackendFake() {
    try {
      const response = await fetch("http://localhost:5000/autores");
      const autoresJSON = await response.json();
      return autoresJSON;
    } catch (error) {
      console.error("Erro ao carregar do backend fake:", error);
      return [];
    }
  }

  gerarIdAutor() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }

  arrumarAutores(autoresJSON) {
    console.log(autoresJSON);
    if (!autoresJSON) return null;

    return {
      id: autoresJSON.getAutorId() || this.gerarIdAutor(),
      nome: autoresJSON.getNome() || "",
      nacionalidade: autoresJSON.getNacionalidade() || "",
      biografia: autoresJSON.getBiografia() || "",
    };
  }

  async salvarAutores(autores) {
    console.log(autores);
    try {
      const lista = await this.carregarAutores();
      if (lista.find((a) => a.nome === autores.getNome())) {
        console.error("Nome já existe!");
        return false;
      }
      const objeto = this.arrumarAutores(autores);

      if (!objeto) {
        console.error("Dados do autor inválidos");
        return false;
      }

      lista.push(objeto);
      localStorage.setItem(this.chaveAutor, JSON.stringify(lista));
      return true;
    } catch (e) {
      console.error("Erro ao salvar autores no localStorage:", e);
      return false;
    }
  }

  async atualizarAutores(id, autor) {
    try {
      if (!id || !autor) {
        console.error("ID ou autor não fornecido");
        return false;
      }

      const lista = await this.carregarAutores();
      const index = lista.findIndex((a) => a.id === id);

      if (index === -1) {
        console.error("Autor não encontrado para atualização");
        return false;
      }

      // Mantém o ID original e atualiza outros campos
      const autorAtualizado = {
        ...lista[index], // mantém dados existentes
        ...this.arrumarAutores(autor), // aplica novas propriedades
        id: id, // GARANTE que o ID não mude
      };

      lista[index] = autorAtualizado;
      localStorage.setItem(this.chaveAutor, JSON.stringify(lista));
      return true;
    } catch (e) {
      console.error("Erro ao atualizar autores no localStorage:", e);
      return false;
    }
  }

  async excluirAutor(id) {
    try {
      if (!id) {
        console.error("ID não fornecido");
        return false;
      }

      const lista = await this.carregarAutores();
      const novaLista = lista.filter((a) => a.id !== id);

      // Verifica se realmente removeu algum item
      if (novaLista.length === lista.length) {
        console.error("Autor não encontrado para exclusão");
        return false;
      }

      localStorage.setItem(this.chaveAutor, JSON.stringify(novaLista));
      return true;
    } catch (e) {
      console.error("Erro ao excluir autor do localStorage:", e);
      return false;
    }
  }

  // Método alternativo com nome diferente (para compatibilidade)
  async deletarAutores(id) {
    return this.excluirAutor(id);
  }
}
