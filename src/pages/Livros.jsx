import { Table, Button, Modal, Popconfirm, message, Space, Grid } from "antd";
import InnerLayout from "../components/InnerLayout";
import LivrosDAO from "../daos/LivrosDAO.mjs";
import AutoresDAO from "../daos/AutoresDAO.mjs";
import { useEffect, useState, useCallback } from "react";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import Caixa from "../components/Caixa.jsx";

export default function Livros() {
  const [data, setData] = useState([]);
  const [autoresMap, setAutoresMap] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [livroSelecionado, setLivroSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [loading, setLoading] = useState(false);

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  // Carregar autores
  const carregarAutores = useCallback(async () => {
    const autoresDAO = new AutoresDAO();
    const lista = await autoresDAO.carregarAutores();

    const mapa = {};
    lista.forEach((a) => {
      mapa[a.id] = a.nome;
    });

    setAutoresMap(mapa);
  }, []);

  // Carregar livros
  const carregarLivros = useCallback(async () => {
    setLoading(true);
    try {
      const livrosDAO = new LivrosDAO();
      const lista = await livrosDAO.carregarLivros();
      setData(Array.isArray(lista) ? lista : []);
    } catch (error) {
      console.error("Erro ao carregar livros:", error);
      message.error("Erro ao carregar livros!");
    } finally {
      setLoading(false);
    }
  }, []);

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
    }, 100);

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
      const livrosDAO = new LivrosDAO();
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

  const handleEditar = (record, e) => {
    e?.stopPropagation();
    showModal(record);
  };

  const handleExcluir = (id, e) => {
    e?.stopPropagation();
    excluirLivro(id);
  };

  // -------------------------
  // COLUNAS (todas visíveis + scroll horizontal)
  // -------------------------
  const columns = [
    {
      title: "Título",
      dataIndex: "titulo",
      key: "titulo",
    },
    {
      title: "Ano",
      dataIndex: "ano",
      key: "ano",
    },
    {
      title: "ISBN",
      dataIndex: "isbn",
      key: "isbn",
      render: (isbn) => <span>{isbn || "-"}</span>,
    },
    {
      title: "Categoria",
      dataIndex: "categoria",
      key: "categoria",
    },
    {
      title: "Autor",
      dataIndex: "autorId",
      key: "autorId",
      render: (autorId) => autoresMap[autorId] || "Autor não encontrado",
    },
    {
      title: "Ações",
      key: "acoes",
      fixed: screens.xs ? false : "right",
      render: (_, record) => (
        <Space direction={screens.xs ? "vertical" : "horizontal"}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={(e) => handleEditar(record, e)}
          >
            Editar
          </Button>

          <Popconfirm
            title="Excluir Livro"
            description="Tem certeza que deseja excluir este livro?"
            onConfirm={(e) => handleExcluir(record.id, e)}
            onCancel={(e) => e?.stopPropagation()}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            >
              Excluir
            </Button>
          </Popconfirm>
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
        padding: "10px 20px",
      }}
      onClick={() => showModal()}
    >
      {screens.xs ? "Novo" : "Novo Livro"}
    </Button>
  );

  return (
    <InnerLayout title="Gerenciar Livros" extra={<CustomButton />}>
      <Table
        columns={columns}
        dataSource={data}
        locale={{ emptyText: "Nenhum livro cadastrado" }}
        rowKey="id"
        loading={loading}
        scroll={{ x: "max-content" }} // ← mantém todas colunas visíveis
        pagination={{
          pageSize: screens.xs ? 5 : 10,
          showSizeChanger: !screens.xs && !screens.sm,
          showQuickJumper: !screens.xs,
          size: screens.xs ? "small" : "default",
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} livros`,
        }}
        onRow={(record) => ({
          onClick: () => {
            showModal(record);
          },
        })}
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
