import Pessoa from "./Pessoa.mjs";
export default class Autores extends Pessoa {
  // Atributos
  #autorId;
  #biografia;
  #ativo;

  // Métodos
  setAutorId(id) {
    this.#autorId = id;
  }
  getAutorId() {
    return this.#autorId;
  }
  setBiografia(biografia) {
    this.#biografia = biografia;
  }
  getBiografia() {
    return this.#biografia;
  }
  setAtivo(ativo) {
    this.#ativo = ativo;
  }
  getAtivo() {
    return this.#ativo;
  }
}
