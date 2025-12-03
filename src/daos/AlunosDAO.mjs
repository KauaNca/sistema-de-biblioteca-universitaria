import Aluno from "../objetos/Aluno.mjs";
import Pessoa from "../objetos/Pessoa.mjs";

export default class AlunoDAO {
  //Global key para armazenar a última matrícula. É diferente da chave dos alunos para evitar conflitos no localStorage.
  #chaveMatricula = "ultima_matricula";

  constructor() {
    this.chaveAluno = "alunos";
  }

  carregarAlunos() {
    try {
      const alunosJSON = localStorage.getItem(this.chaveAluno);
      return Promise.resolve(alunosJSON ? JSON.parse(alunosJSON) : []);
    } catch (e) {
      console.error("Erro ao carregar alunos do localStorage: ", e);
      return Promise.resolve([]);
    }
  }

  carregarUltimaMatricula() {
    try {
      const ultimaMatricula = localStorage.getItem(this.#chaveMatricula);
      return ultimaMatricula ? parseInt(ultimaMatricula, 10) : 0;
    } catch (e) {
      console.error("Erro ao carregar última matrícula: ", e);
      return 0;
    }
  }

  salvarUltimaMatricula(matricula) {
    try {
      localStorage.setItem(this.#chaveMatricula, matricula.toString());
    } catch (e) {
      console.error("Erro ao salvar última matrícula: ", e);
    }
  }

  gerarIdAluno() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }

  novaMatricula() {
    // Carrega a última matrícula do localStorage
    const ultimaMatricula = this.carregarUltimaMatricula();
    // Incrementa a matrícula
    const novaMatricula = ultimaMatricula + 1;
    // Salva a nova matrícula no localStorage
    this.salvarUltimaMatricula(novaMatricula);
    return novaMatricula;
  }

  arrumarAluno(aluno) {
    console.log(aluno);
    if (!aluno) return false;

    return {
      id: aluno.getAlunoId() || this.gerarIdAluno(),
      nome: aluno.getNome() || "Sem nome",
      matricula: this.novaMatricula(),
      curso: aluno.getCurso(),
      email: aluno.getEmail(),
      telefone: aluno.getTelefone(),
    };
  }

  async salvarAluno(aluno) {
    try {
      const listaAluno = await this.carregarAlunos();
      if (listaAluno.find((a) => a.nome === aluno.getNome())) {
        console.error("Nome já existe!");
        return false;
      }
      if (listaAluno.find((a) => a.matricula === aluno.getMatricula())) {
        console.error("Matricula já existe!");
        return false;
      }
      const objeto = this.arrumarAluno(aluno);

      if (!objeto) {
        console.error("Dados do autor inválidos");
        return false;
      }

      // Verifica se já existe um aluno com essa matrícula
      const matriculaExistente = listaAluno.some(
        (a) => a.matricula === objeto.matricula
      );
      if (matriculaExistente) {
        console.error("Matrícula já existe!");
        return false;
      }

      listaAluno.push(objeto);
      localStorage.setItem(this.chaveAluno, JSON.stringify(listaAluno));
      return true;
    } catch (e) {
      console.error("Erro ao salvar alunos no localStorage:", e);
      return false;
    }
  }

  async atualizarAluno(id, aluno) {
    try {
      if (!id || !aluno) {
        console.error("ID ou aluno não fornecido");
        return false;
      }
      const lista = await this.carregarAlunos();
      const index = lista.findIndex((a) => a.id === id);

      if (index === -1) {
        console.error("Aluno não encontrado");
        return false;
      }
      console.log(aluno);
      const matriculaOriginal = lista[index].matricula;
      const alunoAtualizado = {
        ...lista[index],
        nome: aluno.nomeAluno,
        curso: aluno.curso,
        email: aluno.email,
        telefone: aluno.telefone,
        id: id,
        matricula: matriculaOriginal,
      };

      lista[index] = alunoAtualizado;
      localStorage.setItem(this.chaveAluno, JSON.stringify(lista));
      return true;
    } catch (e) {
      console.error("Erro ao atualizar alunos no localStorage:", e);
      return false;
    }
  }

  async excluirAluno(id) {
    try {
      if (!id) {
        console.error("ID não fornecido");
        return false;
      }

      const lista = await this.carregarAlunos();
      const novaLista = lista.filter((a) => a.id !== id);

      // Verifica se realmente removeu algum item
      if (novaLista.length === lista.length) {
        console.error("Aluno não encontrado para exclusão");
        return false;
      }

      localStorage.setItem(this.chaveAluno, JSON.stringify(novaLista));
      return true;
    } catch (e) {
      console.error("Erro ao excluir aluno do localStorage:", e);
      return false;
    }
  }
  resetarMatriculas(novaMatricula = 0) {
    this.salvarUltimaMatricula(novaMatricula);
    console.log("Contagem de matrículas reiniciada para:", novaMatricula);
  }
}
