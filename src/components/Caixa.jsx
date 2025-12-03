// Caixa.jsx
import React from "react";
import { Modal, Form, Input, Select, message } from "antd";
import Autores from "../objetos/Autores.mjs";
import AutoresDAO from "../daos/AutoresDAO.mjs";
import Livros from "../objetos/Livros.mjs";
import LivrosDAO from "../daos/LivrosDAO.mjs";
import Aluno from "../objetos/Aluno.mjs";
import AlunosDAO from "../daos/AlunosDAO.mjs";
import EmprestimoDAO from "../daos/EmprestimoDAO.mjs";
import CaixaSeletora from "./CaixaSeletora";

const { Option } = Select;
const { TextArea } = Input;

function Caixa({ isModalOpen, handleOk, handleCancel, tipo, dados }) {
  const [form] = Form.useForm();
  const [autores, setAutores] = React.useState([]);
  const [alunos, setAlunos] = React.useState([]);
  const [livros, setLivros] = React.useState([]);

  async function buscarAlunos() {
    const alunos = await new AlunosDAO().carregarAlunos();
    return alunos || [];
  }
  async function buscarLivros() {
    const livros = new LivrosDAO().carregarLivros();
    return livros || [];
  }

  // Carrega autores quando o modal abre para tipo === 2 (formulário de livro)
  React.useEffect(() => {
    if (tipo === 2) {
      const autoresDAO = new AutoresDAO();
      autoresDAO.carregarAutores().then((lista) => {
        // lista já é array de objetos salvos (id, nome, ...)
        setAutores(Array.isArray(lista) ? lista : []);
      });
    } else if (tipo === 4) {
      buscarAlunos().then((lista) => {
        setAlunos(Array.isArray(lista) ? lista : []);
      });
      buscarLivros().then((lista) => {
        setLivros(Array.isArray(lista) ? lista : []);
      });
    }
  }, [tipo, isModalOpen]);

  // Preenche o formulário quando temos dados (edição)
  React.useEffect(() => {
    if (dados && tipo === 1) {
      form.setFieldsValue({
        nome: dados.nome,
        nacionalidade: dados.nacionalidade,
        biografia: dados.biografia,
      });
    } else if (dados && tipo === 2) {
      form.setFieldsValue({
        titulo: dados.titulo,
        ano: dados.ano,
        categoria: dados.categoria,
        autorId: dados.autorId,
      });
    } else if (dados && tipo === 3) {
      form.setFieldsValue({
        nomeAluno: dados.nome,
        curso: dados.curso,
        email: dados.email,
        telefone: dados.telefone,
      });
    } else {
      // Limpar formulário quando não há dados (modo criação)
      form.resetFields();
    }
  }, [dados, tipo, form]);

  // ---------- CRUD / helpers ----------
  function editarAutor(values) {
    if (!dados) return;
    const autoresDAO = new AutoresDAO();
    autoresDAO.atualizarAutores(dados.id, values).then((ok) => {
      if (!ok) console.error("Falha ao atualizar autor");
    });
  }

  function editarLivro(values) {
    if (!dados) return;
    const livrosDAO = new LivrosDAO();
    // Monta um objeto Livros a partir dos valores do formulário
    const livro = new Livros();
    livro.setLivroId(dados.id); // garante ID correto
    livro.setTitulo(values.titulo);
    // ISBN NÃO é alterado (é gerado na criação); manter o ISBN atual
    livro.setAno(values.ano);
    livro.setCategoria(values.categoria);
    livro.setAutorId(values.autorId);
    livrosDAO.atualizarLivros(dados.id, livro).then((ok) => {
      if (!ok) console.error("Falha ao atualizar livro");
    });
  }

  function editarAluno(values) {
    if (!dados) return;
    const alunosDAO = new AlunosDAO();
    alunosDAO.atualizarAluno(dados.id, values).then((ok) => {
      if (!ok) console.error("Falha ao atualizar aluno");
    });
  }

  // onFinish trata criação/edição para os três tipos
  const onFinish = async (values) => {
    try {
      // AUTOR (tipo 1)
      if (tipo === 1) {
        if (dados) {
          // edição
          editarAutor(values);
        } else {
          // criação
          const novoAutor = new Autores();
          const autoresDAO = new AutoresDAO();
          const autorId = autoresDAO.gerarIdAutor();
          novoAutor.setAutorId(autorId);
          novoAutor.setNome(values.nome);
          novoAutor.setNacionalidade(values.nacionalidade);
          novoAutor.setBiografia(values.biografia);
          const resposta = await autoresDAO.salvarAutores(novoAutor);
          if (!resposta) {
            message.error("Falha ao salvar autor (Autor pode já existir)");
            return;
          }
        }
      }

      // LIVRO (tipo 2) - ISBN gerado automaticamente no DAO
      if (tipo === 2) {
        const livrosDAO = new LivrosDAO();
        if (dados) {
          // edição
          editarLivro(values);
        } else {
          // criação
          const novoLivro = new Livros();
          novoLivro.setTitulo(values.titulo);
          novoLivro.setAno(values.ano);
          novoLivro.setCategoria(values.categoria);
          novoLivro.setAutorId(values.autorId || null);
          const resposta = await livrosDAO.salvarLivros(novoLivro);
          if (!resposta) {
            message.error(
              "Falha ao salvar livro (Título ou ISBN pode já existir)"
            );
            return;
          }
        }
      }

      // ALUNO (tipo 3)
      if (tipo === 3) {
        if (dados) {
          editarAluno(values);
        } else {
          const novoAluno = new Aluno();
          // campos do formulário de aluno: nomeAluno, curso, email, telefone
          novoAluno.setNome(values.nomeAluno);
          if (values.curso) novoAluno.setCurso(values.curso);
          if (values.email) novoAluno.setEmail(values.email);
          if (values.telefone) novoAluno.setTelefone(values.telefone);

          const alunosDAO = new AlunosDAO();
          const resposta = await alunosDAO.salvarAluno(novoAluno);
          if (!resposta) {
            message.error(
              "Falha ao salvar aluno (nome ou matrícula podem já existir)"
            );
            return;
          }
        }
      }
      // EMPRÉSTIMO (tipo 4)
      if (tipo === 4) {
        const emprestimoDAO = new EmprestimoDAO();
        console.log("Valores do formulário de empréstimo:", values);
        emprestimoDAO.salvarEmprestimo(values);
      }

      // fecha modal e reseta formulário
      form.resetFields();
      handleOk();
    } catch (e) {
      console.error("Erro no onFinish:", e);
    }
  };

  const handleModalOk = () => {
    form.submit();
  };

  // título do modal condicional por tipo
  const modalTitle = (() => {
    if (dados) {
      if (tipo === 1) return "Editar Autor";
      if (tipo === 2) return "Editar Livro";
      if (tipo === 3) return "Editar Aluno";
    } else {
      if (tipo === 1) return "Cadastrar Autor";
      if (tipo === 2) return "Cadastrar Livro";
      if (tipo === 3) return "Cadastrar Aluno";
      if (tipo === 4) return "Registrar Empréstimo";
    }
    return "";
  })();

  return (
    <Modal
      title={modalTitle}
      open={isModalOpen}
      onOk={handleModalOk}
      onCancel={() => {
        form.resetFields();
        handleCancel();
      }}
      okText="Salvar"
      cancelText="Cancelar"
      width={600}
      destroyOnClose={true}
    >
      {tipo === 1 && (
        <Form
          form={form}
          layout="vertical"
          name="autorForm"
          onFinish={onFinish}
        >
          <Form.Item
            label="Nome do Autor"
            name="nome"
            rules={[
              { required: true, message: "Por favor, insira o nome do autor!" },
            ]}
          >
            <Input placeholder="Digite o nome completo do autor" />
          </Form.Item>

          <Form.Item
            label="Nacionalidade"
            name="nacionalidade"
            rules={[
              { required: true, message: "Por favor, insira a nacionalidade!" },
            ]}
          >
            <Input placeholder="Ex: Brasileiro, Americano, etc." />
          </Form.Item>

          <Form.Item label="Biografia" name="biografia">
            <TextArea rows={4} placeholder="Breve biografia do autor..." />
          </Form.Item>
        </Form>
      )}

      {tipo === 2 && (
        <Form
          form={form}
          layout="vertical"
          name="livroForm"
          onFinish={onFinish}
        >
          <Form.Item
            label="Título do Livro"
            name="titulo"
            rules={[
              {
                required: true,
                message: "Por favor, insira o título do livro!",
              },
            ]}
          >
            <Input placeholder="Digite o título do livro" />
          </Form.Item>

          {/* ISBN NÃO aparece no formulário — será gerado automaticamente pelo DAO */}

          <Form.Item
            label="Ano de Publicação"
            name="ano"
            rules={[
              {
                required: true,
                message: "Por favor, insira o ano de publicação!",
              },
            ]}
          >
            <Input type="number" placeholder="Ex: 2020" />
          </Form.Item>

          <Form.Item
            label="Categoria"
            name="categoria"
            rules={[
              { required: true, message: "Por favor, selecione a categoria!" },
            ]}
          >
            <Select placeholder="Selecione uma categoria">
              <Option value="Computação">Computação</Option>
              <Option value="Tecnologia">Tecnologia</Option>
              <Option value="Literatura">Literatura</Option>
              <Option value="Ciências">Ciências</Option>
              <Option value="Matemática">Matemática</Option>
              <Option value="Filosofia">Filosofia</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Autor"
            name="autorId"
            rules={[
              { required: true, message: "Por favor, selecione o autor!" },
            ]}
          >
            <Select placeholder="Selecione o autor">
              {autores.length === 0 ? (
                <Option value={null} disabled>
                  Nenhum autor cadastrado
                </Option>
              ) : (
                autores.map((a) => (
                  <Option key={a.id} value={a.id}>
                    {a.nome}
                  </Option>
                ))
              )}
            </Select>
          </Form.Item>
        </Form>
      )}

      {tipo === 3 && (
        <Form
          form={form}
          layout="vertical"
          name="alunoForm"
          onFinish={onFinish}
        >
          <Form.Item
            label="Nome do Aluno"
            name="nomeAluno"
            rules={[
              { required: true, message: "Por favor, insira o nome do aluno!" },
            ]}
          >
            <Input placeholder="Digite o nome completo do aluno" />
          </Form.Item>
          <Form.Item
            label="Curso"
            name="curso"
            rules={[{ required: true, message: "Por favor, insira o curso!" }]}
          >
            <Select placeholder="Selecione o curso">
              <Option value="Engenharia da Computação">
                Engenharia da Computação
              </Option>
              <Option value="Direito">Direito</Option>
              <Option value="Medicina">Medicina</Option>
              <Option value="Administração">Administração</Option>
              <Option value="Psicologia">Psicologia</Option>
              <Option value="Arquitetura">Arquitetura</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="E-mail"
            name="email"
            rules={[
              {
                required: true,
                message: "Por favor, insira o e-mail do aluno!",
              },
              { type: "email", message: "Por favor, insira um e-mail válido!" },
            ]}
          >
            <Input placeholder="exemplo@email.com" />
          </Form.Item>

          <Form.Item label="Telefone" name="telefone">
            <Input placeholder="(00) 00000-0000" />
          </Form.Item>
        </Form>
      )}
      {/*Empréstimo*/}
      {tipo === 4 && (
        <Form
          form={form}
          layout="vertical"
          name="emprestimoForm"
          onFinish={onFinish}
        >
          <Form.Item
            label="Alunos"
            name="alunosSelecionados"
            rules={[
              { required: true, message: "Por favor, selecione um aluno" },
            ]}
          >
            <CaixaSeletora
              options={alunos.map((aluno) => ({
                label: aluno.nome,
                value: aluno.id,
              }))}
              placeholder="Selecione um aluno"
            />
          </Form.Item>
          <Form.Item
            label="Livros"
            name="livrosSelecionados"
            rules={[
              { required: true, message: "Por favor, selecione um livro" },
            ]}
          >
            <CaixaSeletora
              options={livros.map((livros) => ({
                label: livros.titulo,
                value: livros.id,
              }))}
              placeholder="Selecione um livro"
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}

export default Caixa;
