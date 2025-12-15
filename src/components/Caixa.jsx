// Caixa.jsx
import React from "react";
import { Modal, Form, Input, Select, message } from "antd";
import AutoresDAOHibrido from "../daos/AutoresDAOHibrido.mjs";
import Autores from "../objetos/Autores.mjs";
import Livros from "../objetos/Livros.mjs";
import LivrosDAOHibrido from "../daos/LivrosDAOHibrido.mjs";
import Aluno from "../objetos/Aluno.mjs";
import AlunosDAOHibrido from "../daos/AlunoDAOHibrido.mjs";
import EmprestimosDAOHibrido from "../daos/EmprestimosDAOHibrido.mjs";
import CaixaSeletora from "./CaixaSeletora";
import Emprestimo from "../objetos/Emprestimo.mjs";

const { Option } = Select;
const { TextArea } = Input;

function Caixa({ isModalOpen, handleOk, handleCancel, tipo, dados }) {
  const [form] = Form.useForm();
  const [autores, setAutores] = React.useState([]);
  const [alunos, setAlunos] = React.useState([]);
  const [livros, setLivros] = React.useState([]);

  // Função de máscara para telefone
  const aplicarMascaraTelefone = (value) => {
    if (!value) return "";

    // Remove tudo que não é número
    const apenasNumeros = value.replace(/\D/g, "");

    // Aplica a máscara baseada no tamanho
    if (apenasNumeros.length <= 10) {
      // Formato: (00) 0000-0000
      return apenasNumeros
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .replace(/(-\d{4})\d+?$/, "$1");
    } else {
      // Formato: (00) 00000-0000
      return apenasNumeros
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .replace(/(-\d{4})\d+?$/, "$1");
    }
  };

  // Função de máscara para ano (limita a 4 dígitos)
  const aplicarMascaraAno = (value) => {
    if (!value) return "";

    // Remove tudo que não é número e limita a 4 dígitos
    const apenasNumeros = value.replace(/\D/g, "").slice(0, 4);
    return apenasNumeros;
  };

  function gerarMatriculaSimples() {
    const prefixo = "2024"; // Ano base
    const numero = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return prefixo + numero;
  }

  // Handler para formatar telefone enquanto digita
  const handleTelefoneChange = (e) => {
    const valorFormatado = aplicarMascaraTelefone(e.target.value);
    form.setFieldsValue({ telefone: valorFormatado });
  };

  // Handler para formatar ano enquanto digita
  const handleAnoChange = (e) => {
    const valorFormatado = aplicarMascaraAno(e.target.value);
    form.setFieldsValue({ ano: valorFormatado });
  };

  async function buscarAlunos() {
    const alunos = await new AlunosDAOHibrido().carregarAlunos();
    return alunos || [];
  }
  async function buscarLivros() {
    const livros = new LivrosDAOHibrido().carregarLivros();
    return livros || [];
  }

  // Carrega autores quando o modal abre para tipo === 2 (formulário de livro)
  React.useEffect(() => {
    if (tipo === 2) {
      const autoresDAO = new AutoresDAOHibrido();
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
      // Aplica a máscara no telefone ao preencher os dados
      const telefoneFormatado = dados.telefone
        ? aplicarMascaraTelefone(dados.telefone)
        : "";
      form.setFieldsValue({
        nomeAluno: dados.nome,
        curso: dados.curso,
        email: dados.email,
        telefone: telefoneFormatado,
      });
    } else {
      // Limpar formulário quando não há dados (modo criação)
      form.resetFields();
    }
  }, [dados, tipo, form]);

  // ---------- CRUD / helpers ----------
  function editarAutor(values) {
    if (!dados) return;
    const autoresDAO = new AutoresDAOHibrido();
    autoresDAO.atualizarAutores(dados.id, values).then((ok) => {
      if (!ok) console.error("Falha ao atualizar autor");
    });
  }

  function editarLivro(values) {
    if (!dados) return;
    const livrosDAO = new LivrosDAOHibrido();
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
    const alunosDAO = new AlunosDAOHibrido();
    // Remove a máscara do telefone antes de salvar
    const dadosParaSalvar = {
      ...values,
      telefone: values.telefone ? values.telefone.replace(/\D/g, "") : "",
    };
    alunosDAO.atualizarAluno(dados.id, dadosParaSalvar).then((ok) => {
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
          const autoresDAO = new AutoresDAOHibrido();
          // const autorId = autoresDAO.gerarIdAutor();
          // novoAutor.setAutorId(autorId);
          novoAutor.setNome(values.nome);
          novoAutor.setNacionalidade(values.nacionalidade);
          novoAutor.setBiografia(values.biografia);
          const resposta = await autoresDAO.salvarAutor(novoAutor);
          if (!resposta) {
            message.error("Falha ao salvar autor (Autor pode já existir)");
            return;
          }
        }
      }

      // LIVRO (tipo 2) - ISBN gerado automaticamente no DAO
      if (tipo === 2) {
        const livrosDAO = new LivrosDAOHibrido();
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
          const resposta = await livrosDAO.salvarLivro(novoLivro);
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
          // Remove a máscara do telefone antes de editar
          const valoresEditados = {
            ...values,
            telefone: values.telefone ? values.telefone.replace(/\D/g, "") : "",
          };
          editarAluno(valoresEditados);
        } else {
          const novoAluno = new Aluno();
          // Remove a máscara do telefone antes de salvar
          const telefoneLimpo = values.telefone
            ? values.telefone.replace(/\D/g, "")
            : "";

          // campos do formulário de aluno: nomeAluno, curso, email, telefone
          novoAluno.setNome(values.nomeAluno);
          novoAluno.setMatricula(gerarMatriculaSimples());
          if (values.curso) novoAluno.setCurso(values.curso);
          if (values.email) novoAluno.setEmail(values.email);
          if (telefoneLimpo) novoAluno.setTelefone(telefoneLimpo);

          const alunosDAO = new AlunosDAOHibrido();
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
      // Dentro do onFinish, na parte do tipo 4, substituir por:
      if (tipo === 4) {
        try {
          const emprestimoDAO = new EmprestimosDAOHibrido();

          // Debug: verificar o que está sendo enviado
          console.log("Dados do formulário de empréstimo:", values);

          // Criar empréstimo no formato correto
          const dadosEmprestimo = {
            alunosSelecionados: values.alunosSelecionados,
            livrosSelecionados: values.livrosSelecionados,
          };

          console.log("Dados para salvar:", dadosEmprestimo);

          // Salvar e aguardar resposta
          const resultado = await emprestimoDAO.salvarEmprestimo(
            dadosEmprestimo
          );

          console.log("Resultado do salvamento:", resultado);

          if (resultado) {
            message.success("Empréstimo registrado com sucesso!");
            // fecha modal e reseta formulário
            form.resetFields();
            handleOk();
          } else {
            message.error("Falha ao salvar empréstimo");
          }
        } catch (error) {
          console.error("Erro ao salvar empréstimo:", error);
          message.error("Erro ao registrar empréstimo: " + error.message);
        }
        return; // Importante: sair da função após tratar tipo 4
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
              {
                pattern: /^\d{4}$/,
                message: "Por favor, insira um ano válido (4 dígitos)!",
              },
            ]}
          >
            <Input
              type="text"
              placeholder="Ex: 2020"
              onChange={handleAnoChange}
              maxLength={4}
            />
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

          <Form.Item
            label="Telefone"
            name="telefone"
            rules={[
              {
                pattern: /^\(\d{2}\) \d{4,5}-\d{4}$/,
                message: "Por favor, insira um telefone válido!",
              },
            ]}
          >
            <Input
              placeholder="(00) 00000-0000"
              onChange={handleTelefoneChange}
              maxLength={15}
            />
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
            label="Aluno"
            name="alunosSelecionados"
            rules={[
              { required: true, message: "Por favor, selecione um aluno" },
            ]}
          >
            <CaixaSeletora
              options={alunos.map((aluno) => ({
                label: `${aluno.nome} (${aluno.matricula || ""})`,
                value: aluno.id,
              }))}
              placeholder="Selecione um aluno"
            />
          </Form.Item>
          <Form.Item
            label="Livro"
            name="livrosSelecionados"
            rules={[
              { required: true, message: "Por favor, selecione um livro" },
            ]}
          >
            <CaixaSeletora
              options={livros.map((livro) => ({
                label: `${livro.titulo} (${livro.isbn || ""})`,
                value: livro.id,
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
