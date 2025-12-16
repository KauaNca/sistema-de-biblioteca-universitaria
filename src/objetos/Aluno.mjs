import Pessoa from "./Pessoa.mjs";

export default class Aluno extends Pessoa {
  #alunoId;
  #matricula;
  #curso;
  #email;
  #telefone;

  constructor() {
    super();
  }

  setAlunoId(id) {
    this.#alunoId = id;
  }
  getAlunoId() {
    return this.#alunoId;
  }

  setMatricula(matricula) {
    this.#matricula = matricula;
  }
  getMatricula() {
    return this.#matricula;
  }
  setCurso(curso) {
    this.#curso = curso;
  }
  getCurso() {
    return this.#curso;
  }
  setEmail(email) {
    this.#email = email;
  }
  getEmail() {
    return this.#email;
  }
  setTelefone(telefone) {
    this.#telefone = telefone;
  }
  getTelefone() {
    return this.#telefone;
  }
}
