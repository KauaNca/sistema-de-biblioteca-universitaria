// pages/Autores.jsx - VERSÃO HÍBRIDA
import { Table, Button, Modal, Popconfirm, message, Space, Grid, Tag, Tooltip } from "antd";
import InnerLayout from "../components/InnerLayout";
import AutoresDAOHibrido from "../daos/AutoresDAOHibrido.mjs";
import { useEffect, useState, useCallback, useMemo } from "react";
import { EditOutlined, DeleteOutlined, PlusOutlined, CloudSyncOutlined, CloudOutlined } from "@ant-design/icons";
import Caixa from "../components/Caixa.jsx";

export default function Autores() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [autorSelecionado, setAutorSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usandoBackend, setUsandoBackend] = useState(true);
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  // Instância do DAO
  const [autoresDAO] = useState(() => new AutoresDAOHibrido());

  // Função para carregar autores
  const carregarAutores = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await autoresDAO.carregarAutores();
      
      // Verifica status do backend
      setUsandoBackend(autoresDAO.backendAvailable);
      
      // Marca autores locais
      const dadosMarcados = Array.isArray(lista) ? lista.map(autor => ({
        ...autor,
        isLocal: autor.id?.startsWith?.('local_') || false
      })) : [];
      
      setData(dadosMarcados);
      
      // Informa sobre autores locais
      const autoresLocais = dadosMarcados.filter(a => a.isLocal).length;
      if (autoresLocais > 0) {
        message.info(`${autoresLocais} autor(es) aguardando sincronização`);
      }
      
    } catch (error) {
      console.error("Erro ao carregar autores:", error);
      
      // Fallback para dados de exemplo
      setData([
        {
          id: "local_1",
          nome: "Autor exemplo (Local)",
          nacionalidade: "Brasileiro",
          biografia: "Exemplo de biografia",
          isLocal: true
        }
      ]);
      
      message.warning("Usando dados locais - Backend indisponível");
      setUsandoBackend(false);
      
    } finally {
      setLoading(false);
    }
  }, [autoresDAO]);

  // Carrega autores quando o componente montar
  useEffect(() => {
    carregarAutores();
  }, [carregarAutores]);

  const showModal = (dados = null) => {
    setAutorSelecionado(dados);
    setModoEdicao(!!dados);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    setIsModalOpen(false);
    setAutorSelecionado(null);
    setModoEdicao(false);

    setTimeout(() => {
      carregarAutores();
    }, 300);

    message.success(
      modoEdicao ? "Autor atualizado com sucesso!" : "Autor criado com sucesso!"
    );
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setAutorSelecionado(null);
    setModoEdicao(false);
  };

  const excluirAutor = async (id) => {
    try {
      const sucesso = await autoresDAO.excluirAutor(id);

      if (sucesso) {
        await carregarAutores();
        message.success("Autor excluído com sucesso!");
      } else {
        message.error("Não foi possível excluir o autor!");
      }
    } catch (error) {
      message.error("Erro ao excluir autor!");
      console.error("Erro ao excluir:", error);
    }
  };

  // Sincronizar dados
  const sincronizarDados = async () => {
    setLoading(true);
    try {
      const sucesso = await autoresDAO.sincronizar();
      
      if (sucesso) {
        await carregarAutores();
        message.success("Autores sincronizados com sucesso!");
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
    excluirAutor(id);
  };

  const columns = useMemo(() => {
    const isMobile = !screens.md && !screens.lg && !screens.xl && !screens.xxl;
    
    if (isMobile) {
      return [
        {
          title: "Autor",
          key: "autor",
          render: (_, record) => (
            <div>
              <div style={{ fontWeight: 'bold' }}>{record.nome}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {record.nacionalidade}
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
                title="Excluir este autor?"
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
        title: "Nacionalidade",
        dataIndex: "nacionalidade",
        key: "nacionalidade",
        width: 150,
        render: (text) => text || "-",
      },
      {
        title: "Biografia",
        dataIndex: "biografia",
        key: "biografia",
        width: 300,
        render: (text) => (
          <span title={text}>
            {text && text.length > 60 ? `${text.substring(0, 60)}...` : text || "-"}
          </span>
        ),
      },
      {
        title: "Livros",
        key: "livros",
        width: 100,
        render: (_, record) => (
          <Tag color="blue">
            {Array.isArray(record.livros) ? record.livros.length : 0} livro(s)
          </Tag>
        ),
        responsive: ["lg"],
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
              title="Excluir este autor?"
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
        <Tooltip title="Sincronizar autores locais">
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
        {screens.xs ? "Novo" : "Novo Autor"}
      </Button>
    </Space>
  );

  return (
    <InnerLayout 
      title="Gerenciar Autores" 
      extra={<CustomButton />}
      subTitle={!usandoBackend ? "⚠️ Modo offline - Dados locais" : null}
    >
      <Table
        columns={columns}
        dataSource={data}
        locale={{ 
          emptyText: usandoBackend 
            ? "Nenhum autor cadastrado" 
            : "Nenhum autor local. Backend indisponível."
        }}
        rowKey="id"
        loading={loading}
        scroll={screens.xs ? { x: 500 } : screens.sm ? { x: 700 } : {}}
        onRow={(record) => ({
          onClick: () => showModal(record),
          style: {
            cursor: "pointer",
            transition: "all 0.3s",
          },
        })}
        pagination={{
          pageSize: screens.xs ? 5 : 10,
          showSizeChanger: !screens.xs && !screens.sm,
          showQuickJumper: !screens.xs,
          size: screens.xs ? "small" : "default",
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} autor(es)`,
        }}
        size={screens.xs ? "small" : screens.sm ? "middle" : "default"}
        rowClassName={(record) => 
          record.isLocal ? "bg-yellow-50 hover:bg-yellow-100" : "hover:bg-gray-50"
        }
      />

      <Caixa
        isModalOpen={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        dados={autorSelecionado}
        tipo={1}
      />
    </InnerLayout>
  );
}