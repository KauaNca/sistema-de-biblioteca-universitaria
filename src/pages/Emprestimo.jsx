import { Button, Table, Tag, Space } from "antd"; // Adicione Tag e Space
import { useState, useEffect } from "react";
import AlunoDAO from "../daos/AlunosDAO.mjs";
import Caixa from "../components/Caixa.jsx";

function Emprestimo() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [livros, setLivros] = useState([]);

  const [showModalDevolucao, setShowModalDevolucao] = useState(false);

  // Funções de exemplo para os botões
  async function handleDevolucao(id, event) {
    event.stopPropagation();
    const emprestimoDAO = new (
      await import("../daos/EmprestimoDAO.mjs")
    ).default();
    emprestimoDAO.devolverEmprestimo(id);
    buscarEmprestimos();
  }

  const showModal = () => {
    setShowModalDevolucao(true);
  };
  const handleOk = () => {
    setShowModalDevolucao(false);
    buscarEmprestimos();
  };
  const handleCancel = () => {
    setShowModalDevolucao(false);
    buscarEmprestimos();
  };
  async function buscarEmprestimos() {
    const emprestimosDAO = new (
      await import("../daos/EmprestimoDAO.mjs")
    ).default();
    const listaEmprestimos = await emprestimosDAO.carregarEmprestimos();
    console.log("Empréstimos carregados:", listaEmprestimos);
    setEmprestimos(listaEmprestimos);
  }
  async function buscarAlunos() {
    const alunos = (await new AlunoDAO().carregarAlunos()) || [];
    console.log("Alunos carregados:", alunos);
    setAlunos(alunos);
  }
  async function buscarLivros() {
    const livrosDAO = new (await import("../daos/LivrosDAO.mjs")).default();
    const listaLivros = await livrosDAO.carregarLivros();
    setLivros(listaLivros);
  }
  useEffect(() => {
    buscarAlunos();
    buscarEmprestimos();
    buscarLivros();
  }, []);

  function filtrarLivrosPorIds(ids) {
    if (!ids) return "N/A";
    const nomesLivros = livros
      .filter((livro) => livro.id === ids)
      .map((livro) => livro.titulo);
    return nomesLivros.join(", ") || "N/A";
  }

  const columns = [
    {
      title: "Livro",
      dataIndex: "livro",
      key: "livro",
      render: (record, text) => filtrarLivrosPorIds(text.idLivro) || "N/A",
    },
    {
      title: "Data empréstimo",
      dataIndex: "dataEmprestimo",
      key: "dataEmprestimo",
      render: (data) => new Date(data).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "pendente",
      key: "pendente",
      render: (pendente) =>
        pendente ? (
          <Tag color="red">Pendente</Tag>
        ) : (
          <Tag color="green">Devolvido</Tag>
        ),
    },
    {
      title: "Ações",
      key: "acoes",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={(e) => handleDevolucao(record.id, e)}
            style={{ backgroundColor: "black", color: "white" }}
          >
            Registrar devolução
          </Button>
        </Space>
      ),
    },
  ];
  function novoEmprestimo() {
    showModal();
  }

  return (
    <div className="max-w-full bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-row justify-end p-4">
        <Button className="self-end" onClick={novoEmprestimo}>
          Novo empréstimo
        </Button>
      </div>
      <div className="mt-4rounded-lg shadow-md flex flex-col items-center">
        <div className="w-full bg-gray-200">
          <p className="text-lg p-4 font-bold">Empréstimos por aluno</p>
        </div>
        <Caixa
          tipo={4}
          isModalOpen={showModalDevolucao}
          handleOk={handleOk}
          handleCancel={handleCancel}
        />

        {alunos.length === 0 && (
          <p className="p-4 text-center">Nenhum aluno cadastrado.</p>
        )}
        {alunos.length > 0 && (
          <div className="container rounded-lg m-4 w-full">
            {alunos.map((aluno) => {
              // Filtrar empréstimos do aluno atual
              const emprestimosAluno = emprestimos.filter(
                (e) => e.idAluno === aluno.id
              );

              return (
                <div key={aluno.id} className="border-b border-gray-300 p-4">
                  <div className="flex justify-between">
                    <p className="font-semibold">{aluno.nome}</p>
                    <p>Total de empréstimos: {emprestimosAluno.length}</p>
                  </div>
                  <div className="mt-2">
                    {emprestimosAluno.length === 0 ? (
                      <p className="text-center text-gray-500 p-4">
                        Nenhum empréstimo registrado para este aluno.
                      </p>
                    ) : (
                      <Table
                        columns={columns}
                        dataSource={emprestimosAluno}
                        locale={{ emptyText: "Nenhum livro emprestado" }}
                        rowKey="id"
                        pagination={false}
                        size="small"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Emprestimo;
