import Pessoa from "./Pessoa.mjs";
export default class Autores extends Pessoa {
  // Atributos
  #autorId;
  #biografia;
  #dataFalecimento;
  #generosLiterarios;
  #obrasPublicadas;
  #ativo;

  constructor() {
    super();
  }

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
  setDataFalecimento(dataFalecimento) {
    this.#dataFalecimento = dataFalecimento;
  }
  getDataFalecimento() {
    return this.#dataFalecimento;
  }
  setGenerosLiterarios(generosLiterarios) {
    this.#generosLiterarios = generosLiterarios;
  }
  getGenerosLiterarios() {
    return this.#generosLiterarios;
  }
  setObrasPublicadas(obrasPublicadas) {
    this.#obrasPublicadas = obrasPublicadas;
  }
  getObrasPublicadas() {
    return this.#obrasPublicadas;
  }
  setAtivo(ativo) {
    this.#ativo = ativo;
  }
  getAtivo() {
    return this.#ativo;
  }
}
