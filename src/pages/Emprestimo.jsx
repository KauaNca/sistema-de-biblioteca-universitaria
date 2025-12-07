import { Button, Table, Tag, Space, Grid } from "antd";
import { useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import AlunoDAO from "../daos/AlunosDAO.mjs";
import Caixa from "../components/Caixa.jsx";

function Emprestimo() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [livros, setLivros] = useState([]);
  const [filtro, setFiltro] = useState("");

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const [showModalDevolucao, setShowModalDevolucao] = useState(false);

  async function handleDevolucao(id, event) {
    event.stopPropagation();
    const emprestimoDAO = new (
      await import("../daos/EmprestimoDAO.mjs")
    ).default();
    emprestimoDAO.devolverEmprestimo(id);
    buscarEmprestimos();
  }

  const showModal = () => setShowModalDevolucao(true);
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
    setEmprestimos(listaEmprestimos);
  }

  async function buscarAlunos() {
    const alunos = (await new AlunoDAO().carregarAlunos()) || [];
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
    return (
      livros.find((livro) => livro.id === ids)?.titulo ??
      "N/A"
    );
  }

  function calcularDataPrevista(data) {
    const d = new Date(data);
    d.setMonth(d.getMonth() + 2);
    return d.toLocaleDateString();
  }

  const columns = [
    {
      title: "Livro",
      dataIndex: "livro",
      key: "livro",
      render: (_, record) => filtrarLivrosPorIds(record.idLivro),
    },
    {
      title: "Data empréstimo",
      dataIndex: "dataEmprestimo",
      key: "dataEmprestimo",
      render: (data) => new Date(data).toLocaleDateString(),
    },
    {
      title: "Entrega prevista",
      key: "entregaPrevista",
      render: (_, record) => calcularDataPrevista(record.dataEmprestimo),
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
        <Space orientation={screens.xs ? "vertical" : "horizontal"}>
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

  const CustomButton = () => (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      style={{
        backgroundColor: "black",
        color: "white",
        borderRadius: "5px",
      }}
      onClick={showModal}
      size={screens.xs ? "small" : "middle"}
    >
      {screens.xs ? "Novo" : "Novo Empréstimo"}
    </Button>
  );

  return (
    <div className="max-w-full bg-white p-6 rounded-lg shadow-md">
      
      {/* 🔍 Barra de pesquisa estilizada + botão de limpar */}
      <div className="flex flex-row justify-between p-4">
        <div
          className="flex items-center gap-3 w-1/2 bg-gray-100 border border-gray-300 
          rounded-full px-4 py-2 shadow-sm focus-within:shadow-md transition"
        >
          {/* Ícone */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 text-gray-500"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>

          {/* Campo */}
          <input
            type="text"
            placeholder="Buscar aluno, livro ou status..."
            className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value.toLowerCase())}
          />

          {/* Botão limpar */}
          {filtro.length > 0 && (
            <button
              onClick={() => setFiltro("")}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              ✕
            </button>
          )}
        </div>

        <CustomButton />
      </div>

      <div className="mt-4 rounded-lg shadow-md flex flex-col items-center">
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
              
              const nomeBate = aluno.nome.toLowerCase().includes(filtro);

              let emprestimosAluno = emprestimos.filter(
                (e) => e.idAluno === aluno.id
              );

              const emprestimosFiltrados = emprestimosAluno.filter((emp) => {
                const livroNome = filtrarLivrosPorIds(emp.idLivro).toLowerCase();
                const status = emp.pendente ? "pendente" : "devolvido";
                const data = new Date(emp.dataEmprestimo)
                  .toLocaleDateString()
                  .toLowerCase();

                return (
                  livroNome.includes(filtro) ||
                  status.includes(filtro) ||
                  data.includes(filtro)
                );
              });

              // Regra:
              // Se o nome do aluno combinar → mostrar empréstimos completos
              // Se não combinar → mostrar apenas empréstimos filtrados
              const finalList = nomeBate ? emprestimosAluno : emprestimosFiltrados;

              // Se pesquisa não bate no aluno e nenhum empréstimo → não exibe o aluno
              if (!nomeBate && finalList.length === 0) {
                return null;
              }

              return (
                <div key={aluno.id} className="border-b border-gray-300 p-4">
                  <div className="flex justify-between">
                    <p className="font-semibold">{aluno.nome}</p>
                    <p>Total de empréstimos: {finalList.length}</p>
                  </div>

                  <div className="mt-2">
                    {finalList.length === 0 ? (
                      <p className="text-center text-gray-500 p-4">
                        Nenhum empréstimo encontrado para este aluno.
                      </p>
                    ) : (
                      <Table
                        columns={columns}
                        dataSource={finalList}
                        locale={{ emptyText: "Nenhum livro emprestado" }}
                        rowKey="id"
                        pagination={false}
                        size={screens.xs ? "small" : "default"}
                        scroll={
                          screens.xs ? { x: 500 } : screens.sm ? { x: 600 } : {}
                        }
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
