export default class Livros {
  #livroId;
  #titulo;
  #ano;
  #isbn;
  #categoria;
  #autorId; // FK → vem de Autores

  constructor() {}

  // --- LIVRO ID ---
  setLivroId(id) {
    this.#livroId = id;
  }
  getLivroId() {
    return this.#livroId;
  }

  // --- TÍTULO ---
  setTitulo(titulo) {
    this.#titulo = titulo;
  }
  getTitulo() {
    return this.#titulo;
  }

  // --- ANO ---
  setAno(ano) {
    this.#ano = ano;
  }
  getAno() {
    return this.#ano;
  }

  // --- ISBN ---
  setISBN(isbn) {
    this.#isbn = isbn;
  }
  getIsbn() {
    return this.#isbn;
  }

  // --- CATEGORIA ---
  setCategoria(categoria) {
    this.#categoria = categoria;
  }
  getCategoria() {
    return this.#categoria;
  }

  // --- AUTOR (FK) ---
  setAutorId(autorId) {
    this.#autorId = autorId;
  }
  getAutorId() {
    return this.#autorId;
  }
}
