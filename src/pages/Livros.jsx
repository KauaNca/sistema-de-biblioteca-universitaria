// pages/Livros.jsx - VERSÃO HÍBRIDA
import { Table, Button, Modal, Popconfirm, message, Space, Grid, Tag, Tooltip } from "antd";
import InnerLayout from "../components/InnerLayout";
import LivrosDAOHibrido from "../daos/LivrosDAOHibrido.mjs";
import AutoresDAOHibrido from "../daos/AutoresDAOHibrido.mjs";
import { useEffect, useState, useCallback, useMemo } from "react";
import { EditOutlined, DeleteOutlined, PlusOutlined, CloudSyncOutlined, CloudOutlined } from "@ant-design/icons";
import Caixa from "../components/Caixa.jsx";

export default function Livros() {
  const [data, setData] = useState([]);
  const [autoresMap, setAutoresMap] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [livroSelecionado, setLivroSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usandoBackend, setUsandoBackend] = useState(true);
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  // Instâncias dos DAOs
  const [livrosDAO] = useState(() => new LivrosDAOHibrido());
  const [autoresDAO] = useState(() => new AutoresDAOHibrido());

  // Carregar autores
  const carregarAutores = useCallback(async () => {
    try {
      const lista = await autoresDAO.carregarAutores();
      
      const mapa = {};
      lista.forEach((a) => {
        mapa[a.id] = a.nome;
      });

      setAutoresMap(mapa);
    } catch (error) {
      console.error("Erro ao carregar autores:", error);
    }
  }, [autoresDAO]);

  // Carregar livros
  const carregarLivros = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await livrosDAO.carregarLivros();
      
      // Verifica status do backend
      setUsandoBackend(livrosDAO.backendAvailable);
      
      // Marca livros locais
      const dadosMarcados = Array.isArray(lista) ? lista.map(livro => ({
        ...livro,
        isLocal: livro.id?.startsWith?.('local_') || false
      })) : [];
      
      setData(dadosMarcados);
      
      // Informa sobre livros locais
      const livrosLocais = dadosMarcados.filter(l => l.isLocal).length;
      if (livrosLocais > 0) {
        message.info(`${livrosLocais} livro(s) aguardando sincronização`);
      }
      
    } catch (error) {
      console.error("Erro ao carregar livros:", error);
      
      // Fallback para dados de exemplo
      setData([
        {
          id: "local_1",
          titulo: "Livro exemplo (Local)",
          ano: 2023,
          isbn: "LOCAL-123456",
          categoria: "Exemplo",
          autorId: "local_autor",
          isLocal: true
        }
      ]);
      
      message.warning("Usando dados locais - Backend indisponível");
      setUsandoBackend(false);
      
    } finally {
      setLoading(false);
    }
  }, [livrosDAO]);

  useEffect(() => {
    carregarAutores();
    carregarLivros();
  }, [carregarAutores, carregarLivros]);

  const showModal = (dados = null) => {
    setLivroSelecionado(dados);
    setModoEdicao(!!dados);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    setIsModalOpen(false);
    setLivroSelecionado(null);
    setModoEdicao(false);

    setTimeout(() => {
      carregarLivros();
    }, 300);

    message.success(
      modoEdicao ? "Livro atualizado com sucesso!" : "Livro criado com sucesso!"
    );
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setLivroSelecionado(null);
    setModoEdicao(false);
  };

  const excluirLivro = async (id) => {
    try {
      const sucesso = await livrosDAO.excluirLivro(id);

      if (sucesso) {
        await carregarLivros();
        message.success("Livro excluído com sucesso!");
      } else {
        message.error("Não foi possível excluir o livro!");
      }
    } catch (error) {
      message.error("Erro ao excluir livro!");
      console.error("Erro ao excluir:", error);
    }
  };

  // Sincronizar dados
  const sincronizarDados = async () => {
    setLoading(true);
    try {
      const sucesso = await livrosDAO.sincronizar();
      
      if (sucesso) {
        await carregarLivros();
        message.success("Livros sincronizados com sucesso!");
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

  const handleEditar = (record, e) => {
    e?.stopPropagation();
    showModal(record);
  };

  const handleExcluir = (id, e) => {
    e?.stopPropagation();
    excluirLivro(id);
  };

  const columns = useMemo(() => {
    const isMobile = !screens.md && !screens.lg && !screens.xl && !screens.xxl;
    
    if (isMobile) {
      return [
        {
          title: "Livro",
          key: "livro",
          render: (_, record) => (
            <div>
              <div style={{ fontWeight: 'bold' }}>{record.titulo}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {autoresMap[record.autorId] || "Autor desconhecido"}
                {record.isLocal && (
                  <Tag color="orange" style={{ marginLeft: 8, fontSize: '10px' }}>
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
                title="Excluir este livro?"
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
        title: "Título",
        dataIndex: "titulo",
        key: "titulo",
        width: 250,
        render: (text, record) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{text}</span>
            {record.isLocal && (
              <Tooltip title="Dados locais (não sincronizados)">
                <Tag color="orange" style={{ fontSize: '10px', cursor: 'help' }}>
                  Local
                </Tag>
              </Tooltip>
            )}
          </div>
        ),
      },
      {
        title: "Ano",
        dataIndex: "ano",
        key: "ano",
        width: 80,
        render: (ano) => ano || "-",
      },
      {
        title: "ISBN",
        dataIndex: "isbn",
        key: "isbn",
        width: 150,
        render: (isbn) => (
          <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            {isbn || "-"}
          </span>
        ),
      },
      {
        title: "Categoria",
        dataIndex: "categoria",
        key: "categoria",
        width: 120,
      },
      {
        title: "Autor",
        dataIndex: "autorId",
        key: "autorId",
        width: 180,
        render: (autorId) => (
          <div>
            {autoresMap[autorId] || "Autor não encontrado"}
            {autorId?.startsWith('local_') && (
              <Tag color="red" style={{ marginLeft: 8, fontSize: '10px' }}>
                Local
              </Tag>
            )}
          </div>
        ),
      },
      {
        title: "Status",
        key: "status",
        width: 100,
        render: (_, record) => (
          <Tag color={record.disponivel ? 'green' : 'red'}>
            {record.disponivel ? 'Disponível' : 'Indisponível'}
          </Tag>
        ),
        responsive: ["lg"],
      },
      {
        title: "Ações",
        key: "acoes",
        width: 200,
        fixed: "right",
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
              title="Excluir este livro?"
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
  }, [screens, autoresMap]);

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
        <Tooltip title="Sincronizar livros locais">
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
        {screens.xs ? "Novo" : "Novo Livro"}
      </Button>
    </Space>
  );

  return (
    <InnerLayout 
      title="Gerenciar Livros" 
      extra={<CustomButton />}
      subTitle={!usandoBackend ? "⚠️ Modo offline - Dados locais" : null}
    >
      <Table
        columns={columns}
        dataSource={data}
        locale={{ 
          emptyText: usandoBackend 
            ? "Nenhum livro cadastrado" 
            : "Nenhum livro local. Backend indisponível."
        }}
        rowKey="id"
        loading={loading}
        scroll={{ x: "max-content" }}
        pagination={{
          pageSize: screens.xs ? 5 : 10,
          showSizeChanger: !screens.xs && !screens.sm,
          showQuickJumper: !screens.xs,
          size: screens.xs ? "small" : "default",
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} livro(s)`,
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
          record.isLocal ? "bg-yellow-50 hover:bg-yellow-100" : "hover:bg-gray-50"
        }
      />

      <Caixa
        isModalOpen={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        dados={livroSelecionado}
        tipo={2}
      />
    </InnerLayout>
  );
}