// pages/Alunos.jsx - VERSÃO ATUALIZADA
import {
  Table,
  Button,
  Modal,
  Popconfirm,
  message,
  Space,
  Grid,
  Tag,
  Tooltip,
  Switch,
} from "antd";
import InnerLayout from "../components/InnerLayout";
import AlunosDAOHibrido from "../daos/AlunoDAOHibrido.mjs";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CloudSyncOutlined,
  CloudOutlined,
} from "@ant-design/icons";
import Caixa from "../components/Caixa.jsx";

export default function Alunos() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usandoBackend, setUsandoBackend] = useState(true);
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  // Instância do DAO híbrido
  const [alunosDAO] = useState(() => new AlunosDAOHibrido());

  // Função para carregar Alunos
  const carregarAlunos = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await alunosDAO.carregarAlunos();

      // Verifica se está usando backend ou localStorage
      setUsandoBackend(alunosDAO.backendAvailable);

      // Identifica alunos locais (não sincronizados)
      const dadosMarcados = Array.isArray(lista)
        ? lista.map((aluno) => ({
            ...aluno,
            isLocal: aluno.id?.startsWith?.("local_") || false,
          }))
        : [];

      setData(dadosMarcados);

      // Mensagem informativa
      const alunosLocais = dadosMarcados.filter((a) => a.isLocal).length;
      if (alunosLocais > 0) {
        message.info(`${alunosLocais} aluno(s) aguardando sincronização`);
      }
    } catch (error) {
      console.error("Erro ao carregar Alunos:", error);

      // Fallback para dados de exemplo
      setData([
        {
          id: "local_1",
          nome: "Aluno exemplo (Local)",
          curso: "Ciência da Computação",
          matricula: "20230001",
          email: "aluno@exemplo.com",
          telefone: "(11) 99999-9999",
          isLocal: true,
        },
      ]);

      message.warning("Usando dados locais - Backend indisponível");
      setUsandoBackend(false);
    } finally {
      setLoading(false);
    }
  }, [alunosDAO]);

  // Efeito para carregar dados
  useEffect(() => {
    carregarAlunos();
  }, [carregarAlunos]);

  // Funções do modal
  const showModal = (dados = null) => {
    setAlunoSelecionado(dados);
    setModoEdicao(!!dados);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    setIsModalOpen(false);
    setAlunoSelecionado(null);
    setModoEdicao(false);

    // Aguarda um pouco e recarrega os dados
    setTimeout(() => {
      carregarAlunos();
    }, 300);

    message.success(
      modoEdicao ? "Aluno atualizado com sucesso!" : "Aluno criado com sucesso!"
    );
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setAlunoSelecionado(null);
    setModoEdicao(false);
  };

  // Excluir aluno
  const excluirAluno = async (id) => {
    try {
      const sucesso = await alunosDAO.excluirAluno(id);

      if (sucesso) {
        await carregarAlunos();
        message.success("Aluno excluído com sucesso!");
      } else {
        message.error("Não foi possível excluir o aluno!");
      }
    } catch (error) {
      message.error("Erro ao excluir aluno!");
      console.error("Erro ao excluir:", error);
    }
  };

  // Sincronizar dados locais com backend
  const sincronizarDados = async () => {
    setLoading(true);
    try {
      const sucesso = await alunosDAO.sincronizar();

      if (sucesso) {
        await carregarAlunos();
        message.success("Dados sincronizados com sucesso!");
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

  // Handler para editar
  const handleEditar = (record, e) => {
    e?.stopPropagation();
    showModal(record);
  };

  // Handler para excluir
  const handleExcluir = (id, e) => {
    e?.stopPropagation();
    excluirAluno(id);
  };

  // Colunas da tabela (responsivas)
  const columns = useMemo(() => {
    const isMobile = !screens.md && !screens.lg && !screens.xl && !screens.xxl;

    if (isMobile) {
      return [
        {
          title: "Aluno",
          key: "aluno",
          render: (_, record) => (
            <div>
              <div style={{ fontWeight: "bold" }}>{record.nome}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                {record.curso}
                {record.isLocal && (
                  <Tag
                    color="orange"
                    style={{ marginLeft: 8, fontSize: "10px" }}
                  >
                    Local
                  </Tag>
                )}
              </div>
            </div>
          ),
        },
        {
          title: "Ações",
          key: "acoes",
          width: 100,
          render: (_, record) => (
            <Space>
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={(e) => handleEditar(record, e)}
              />
              <Popconfirm
                title="Excluir este aluno?"
                onConfirm={(e) => handleExcluir(record.id, e)}
              >
                <Button danger icon={<DeleteOutlined />} size="small" />
              </Popconfirm>
            </Space>
          ),
        },
      ];
    }

    // Desktop
    return [
      {
        title: "Nome",
        dataIndex: "nome",
        key: "nome",
        width: 200,
        render: (text, record) => (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>{text}</span>
            {record.isLocal && (
              <Tooltip title="Dados locais (não sincronizados)">
                <Tag
                  color="orange"
                  style={{ fontSize: "10px", cursor: "help" }}
                >
                  Local
                </Tag>
              </Tooltip>
            )}
          </div>
        ),
      },
      {
        title: "Matrícula",
        dataIndex: "matricula",
        key: "matricula",
        width: 150,
      },
      {
        title: "Curso",
        dataIndex: "curso",
        key: "curso",
        width: 180,
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        width: 220,
      },
      {
        title: "Telefone",
        dataIndex: "telefone",
        key: "telefone",
        width: 150,
      },
      {
        title: "Status",
        key: "status",
        width: 100,
        render: (_, record) => (
          <Tag color={record.status === "ativo" ? "green" : "red"}>
            {record.status === "ativo" ? "Ativo" : "Inativo"}
          </Tag>
        ),
      },
      {
        title: "Ações",
        key: "acoes",
        width: 200,
        render: (_, record) => (
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={(e) => handleEditar(record, e)}
              size="small"
            >
              Editar
            </Button>
            <Popconfirm
              title="Excluir este aluno?"
              description="Esta ação não pode ser desfeita."
              onConfirm={(e) => handleExcluir(record.id, e)}
            >
              <Button danger icon={<DeleteOutlined />} size="small">
                Excluir
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ];
  }, [screens]);

  // Botão personalizado no cabeçalho
  const CustomButton = () => (
    <Space>
      <Tooltip
        title={usandoBackend ? "Conectado ao backend" : "Usando dados locais"}
      >
        <Tag
          color={usandoBackend ? "green" : "orange"}
          icon={usandoBackend ? <CloudOutlined /> : <CloudSyncOutlined />}
          style={{ cursor: "default" }}
        >
          {usandoBackend ? "Online" : "Offline"}
        </Tag>
      </Tooltip>

      {!usandoBackend && (
        <Tooltip title="Sincronizar dados locais">
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
        onClick={() => showModal()}
        size={screens.xs ? "small" : "middle"}
      >
        {screens.xs ? "Novo" : "Novo Aluno"}
      </Button>
    </Space>
  );

  return (
    <InnerLayout
      title="Gerenciar Alunos"
      extra={<CustomButton />}
      subTitle={!usandoBackend ? "⚠️ Modo offline - Dados locais" : null}
    >
      <Table
        columns={columns}
        dataSource={data}
        locale={{
          emptyText: usandoBackend
            ? "Nenhum aluno cadastrado"
            : "Nenhum aluno local. Backend indisponível.",
        }}
        rowKey="id"
        loading={loading}
        scroll={screens.xs ? { x: 500 } : screens.sm ? { x: 700 } : {}}
        pagination={{
          pageSize: screens.xs ? 5 : 10,
          showSizeChanger: !screens.xs && !screens.sm,
          showQuickJumper: !screens.xs,
          size: screens.xs ? "small" : "default",
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} aluno(s)`,
        }}
        onRow={(record) => ({
          onClick: () => showModal(record),
          style: {
            cursor: "pointer",
            transition: "all 0.3s",
          },
        })}
        size={screens.xs ? "small" : screens.sm ? "middle" : "default"}
        rowClassName={(record) =>
          record.isLocal
            ? "bg-yellow-50 hover:bg-yellow-100"
            : "hover:bg-gray-50"
        }
      />

      <Caixa
        isModalOpen={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        dados={alunoSelecionado}
        tipo={3}
      />
    </InnerLayout>
  );
}
