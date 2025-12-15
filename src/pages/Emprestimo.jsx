// pages/Emprestimo.jsx - VERSÃO HÍBRIDA
import { Button, Table, Tag, Space, Grid, Tooltip, message } from "antd";
import { useState, useEffect, useCallback } from "react";
import { PlusOutlined, CloudSyncOutlined, CloudOutlined } from "@ant-design/icons";
import AlunosDAOHibrido from "../daos/AlunoDAOHibrido.mjs";
import LivrosDAOHibrido from "../daos/LivrosDAOHibrido.mjs";
import EmprestimosDAOHibrido from "../daos/EmprestimosDAOHibrido.mjs";
import Caixa from "../components/Caixa.jsx";

function Emprestimo() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [livros, setLivros] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(false);
  const [usandoBackend, setUsandoBackend] = useState(true);

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const [showModalDevolucao, setShowModalDevolucao] = useState(false);

  // Instâncias dos DAOs
  const [alunosDAO] = useState(() => new AlunosDAOHibrido());
  const [livrosDAO] = useState(() => new LivrosDAOHibrido());
  const [emprestimosDAO] = useState(() => new EmprestimosDAOHibrido());

  // 🔹 Buscar empréstimos
  const buscarEmprestimos = useCallback(async () => {
    setLoading(true);
    try {
      const listaEmprestimos = await emprestimosDAO.carregarEmprestimos();
      
      // Verifica status do backend
      setUsandoBackend(emprestimosDAO.backendAvailable);
      
      // Marca empréstimos locais
      const dadosMarcados = Array.isArray(listaEmprestimos) ? listaEmprestimos.map(emp => ({
        ...emp,
        isLocal: emp.id?.startsWith?.('local_') || false
      })) : [];
      
      setEmprestimos(dadosMarcados);
      
      // Informa sobre empréstimos locais
      const emprestimosLocais = dadosMarcados.filter(e => e.isLocal).length;
      if (emprestimosLocais > 0) {
        message.info(`${emprestimosLocais} empréstimo(s) aguardando sincronização`);
      }
      
    } catch (error) {
      console.error("Erro ao carregar empréstimos:", error);
      message.warning("Usando dados locais - Backend indisponível");
      setUsandoBackend(false);
    } finally {
      setLoading(false);
    }
  }, [emprestimosDAO]);

  // 🔹 Buscar alunos
  const buscarAlunos = useCallback(async () => {
    try {
      const listaAlunos = await alunosDAO.carregarAlunos();
      setAlunos(Array.isArray(listaAlunos) ? listaAlunos : []);
    } catch (error) {
      console.error("Erro ao carregar alunos:", error);
    }
  }, [alunosDAO]);

  // 🔹 Buscar livros
  const buscarLivros = useCallback(async () => {
    try {
      const listaLivros = await livrosDAO.carregarLivros();
      setLivros(Array.isArray(listaLivros) ? listaLivros : []);
    } catch (error) {
      console.error("Erro ao carregar livros:", error);
    }
  }, [livrosDAO]);

  // 🔹 Registrar devolução
  const handleDevolucao = async (id, event) => {
    event.stopPropagation();
    try {
      const sucesso = await emprestimosDAO.devolverEmprestimo(id);
      
      if (sucesso) {
        await buscarEmprestimos();
        message.success("Devolução registrada com sucesso!");
      } else {
        message.error("Não foi possível registrar a devolução");
      }
    } catch (error) {
      message.error("Erro ao registrar devolução!");
      console.error("Erro na devolução:", error);
    }
  };

  // 🔹 Sincronizar dados
  const sincronizarDados = async () => {
    setLoading(true);
    try {
      const sucesso = await emprestimosDAO.sincronizar();
      
      if (sucesso) {
        await buscarEmprestimos();
        message.success("Empréstimos sincronizados com sucesso!");
      } else {
        message.warning("Sincronização não necessária ou falhou");
      }
    } catch (error) {
      message.error("Erro na sincronização!");
      console.error("Erro na sincronização:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarAlunos();
    buscarEmprestimos();
    buscarLivros();
  }, [buscarAlunos, buscarEmprestimos, buscarLivros]);

  const showModal = () => setShowModalDevolucao(true);
  const handleOk = () => {
    setShowModalDevolucao(false);
    buscarEmprestimos();
  };
  const handleCancel = () => {
    setShowModalDevolucao(false);
    buscarEmprestimos();
  };

  // 🔹 Encontrar livro pelo ID
  function filtrarLivrosPorIds(id) {
    if (!id) return "N/A";
    const livro = livros.find(l => l.id === id);
    return livro ? `${livro.titulo}${livro.isLocal ? ' (Local)' : ''}` : "N/A";
  }

  // 🔹 Encontrar aluno pelo ID
  function filtrarAlunoPorId(id) {
    if (!id) return "N/A";
    const aluno = alunos.find(a => a.id === id);
    return aluno ? `${aluno.nome}${aluno.isLocal ? ' (Local)' : ''}` : "N/A";
  }

  // 🔹 Calcular data prevista (15 dias)
  function calcularDataPrevista(data) {
    if (!data) return "N/A";
    const d = new Date(data);
    d.setDate(d.getDate() + 15);
    return d.toLocaleDateString();
  }

  // 🔹 Verificar se está atrasado
  function verificarAtraso(dataPrevista) {
    if (!dataPrevista) return false;
    const hoje = new Date();
    const prevista = new Date(dataPrevista);
    return hoje > prevista;
  }

  const columns = [
    {
      title: "Livro",
      dataIndex: "idLivro",
      key: "livro",
      render: (idLivro, record) => (
        <div>
          {filtrarLivrosPorIds(idLivro)}
          {record.isLocal && (
            <Tag color="orange" style={{ marginLeft: 8, fontSize: '10px' }}>
              Local
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Aluno",
      dataIndex: "idAluno",
      key: "aluno",
      render: (idAluno) => filtrarAlunoPorId(idAluno),
    },
    {
      title: "Data empréstimo",
      dataIndex: "dataEmprestimo",
      key: "dataEmprestimo",
      render: (data) => data ? new Date(data).toLocaleDateString() : "N/A",
    },
    {
      title: "Entrega prevista",
      key: "entregaPrevista",
      render: (_, record) => {
        const dataPrevista = record.dataDevolucaoPrevista || calcularDataPrevista(record.dataEmprestimo);
        const atrasado = verificarAtraso(dataPrevista);
        
        return (
          <div>
            <span style={{ color: atrasado ? '#ff4d4f' : 'inherit' }}>
              {dataPrevista}
            </span>
            {atrasado && <Tag color="red" style={{ marginLeft: 8 }}>Atrasado</Tag>}
          </div>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        if (record.dataDevolucaoReal || record.status === 'devolvido') {
          return <Tag color="green">Devolvido</Tag>;
        }
        
        const atrasado = verificarAtraso(record.dataDevolucaoPrevista);
        return atrasado ? 
          <Tag color="red">Atrasado</Tag> : 
          <Tag color="blue">Pendente</Tag>;
      },
    },
    {
      title: "Ações",
      key: "acoes",
      render: (_, record) => {
        const jaDevolvido = record.dataDevolucaoReal || record.status === 'devolvido';
        
        return (
          <Space orientation={screens.xs ? "vertical" : "horizontal"}>
            {!jaDevolvido && (
              <Button
                type="primary"
                onClick={(e) => handleDevolucao(record.id, e)}
                style={{ backgroundColor: "black", color: "white" }}
                size="small"
              >
                Registrar devolução
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  const CustomButton = () => (
    <Space>
      <Tooltip title={usandoBackend ? "Conectado ao backend" : "Usando dados locais"}>
        <Tag 
          color={usandoBackend ? "green" : "orange"} 
          icon={usandoBackend ? <CloudOutlined /> : <CloudSyncOutlined />}
          style={{ cursor: 'default' }}
        >
          {usandoBackend ? "Online" : "Offline"}
        </Tag>
      </Tooltip>
      
      {!usandoBackend && (
        <Tooltip title="Sincronizar empréstimos locais">
          <Button
            icon={<CloudSyncOutlined />}
            loading={loading}
            onClick={sincronizarDados}
            size={screens.xs ? "small" : "middle"}
          >
            {screens.xs ? "Sinc." : "Sincronizar"}
          </Button>
        </Tooltip>
      )}
      
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
    </Space>
  );

  // 🔹 Filtrar empréstimos
  const emprestimosFiltrados = emprestimos.filter(emp => {
    if (!filtro) return true;
    
    const livroNome = filtrarLivrosPorIds(emp.idLivro).toLowerCase();
    const alunoNome = filtrarAlunoPorId(emp.idAluno).toLowerCase();
    const status = emp.dataDevolucaoReal ? "devolvido" : "pendente";
    const data = new Date(emp.dataEmprestimo).toLocaleDateString().toLowerCase();
    
    return (
      livroNome.includes(filtro) ||
      alunoNome.includes(filtro) ||
      status.includes(filtro) ||
      data.includes(filtro)
    );
  });

  // 🔹 Agrupar empréstimos por aluno
  const emprestimosPorAluno = alunos.map(aluno => {
    const emprestimosAluno = emprestimosFiltrados.filter(e => e.idAluno === aluno.id);
    
    return {
      aluno,
      emprestimos: emprestimosAluno
    };
  }).filter(item => item.emprestimos.length > 0);

  return (
    <div className="max-w-full bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between p-4 gap-4">
        <div
          className="flex items-center gap-3 w-full md:w-1/2 bg-gray-100 border 
          border-gray-300 rounded-full px-4 py-2 shadow-sm"
        >
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

          <input
            type="text"
            placeholder="Buscar aluno, livro ou status..."
            className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value.toLowerCase())}
          />

          {filtro.length > 0 && (
            <button
              onClick={() => setFiltro("")}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>

        <CustomButton />
      </div>

      <div className="mt-4 rounded-lg shadow-md flex flex-col items-center">
        <div className="w-full bg-gray-200">
          <p className="text-lg p-4 font-bold">
            Empréstimos por aluno
            {!usandoBackend && (
              <Tag color="orange" style={{ marginLeft: 8 }}>
                Modo Local
              </Tag>
            )}
          </p>
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

        {alunos.length > 0 && emprestimosPorAluno.length === 0 && (
          <p className="p-4 text-center">
            {filtro ? "Nenhum empréstimo encontrado com esse filtro." : "Nenhum empréstimo ativo."}
          </p>
        )}

        {emprestimosPorAluno.length > 0 && (
          <div className="container rounded-lg m-4 w-full">
            {emprestimosPorAluno.map(({ aluno, emprestimos }) => (
              <div key={aluno.id} className="border-b border-gray-300 p-4 mb-4">
                <div className="flex flex-col md:flex-row justify-between mb-4">
                  <div>
                    <p className="font-semibold text-lg">
                      {aluno.nome}
                      {aluno.isLocal && (
                        <Tag color="orange" style={{ marginLeft: 8 }}>
                          Local
                        </Tag>
                      )}
                    </p>
                    <p className="text-gray-600">{aluno.curso}</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <Tag color="blue">
                      Total: {emprestimos.length} empréstimo(s)
                    </Tag>
                    <Tag color="red" style={{ marginLeft: 8 }}>
                      Pendentes: {emprestimos.filter(e => !e.dataDevolucaoReal).length}
                    </Tag>
                  </div>
                </div>

                <div className="mt-2">
                  <Table
                    columns={columns}
                    dataSource={emprestimos}
                    locale={{ emptyText: "Nenhum empréstimo" }}
                    rowKey="id"
                    pagination={false}
                    loading={loading}
                    size={screens.xs ? "small" : "default"}
                    scroll={screens.xs ? { x: 500 } : screens.sm ? { x: 600 } : {}}
                    rowClassName={(record) => 
                      record.isLocal ? "bg-yellow-50 hover:bg-yellow-100" : "hover:bg-gray-50"
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Emprestimo;