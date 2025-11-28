import { Table, Button, Modal } from "antd";
import InnerLayout from "../components/InnerLayout";
import AutoresDAO from "../daos/AutoresDAO.mjs";
import { useEffect, useState } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Caixa from "../components/Caixa.jsx";

export default function Autores() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const autores = new AutoresDAO();
    autores.carregarAutores().then((lista) => setData(lista));
  }, []);

  const columns = [
    { title: "Nome", dataIndex: "nome", key: "nome" },
    {
      title: "Nacionalidade",
      dataIndex: "nacionalidade",
      key: "nacionalidade",
    },
    {
      title: "Data de Nascimento",
      dataIndex: "dataNascimento",
      key: "dataNascimento",
    },
    {
      title: "Ações",
      render: () => (
        <>
          <Button type="link">
            <EditOutlined />
            Editar
          </Button>
          <Button type="link" danger>
            <DeleteOutlined /> Excluir
          </Button>
        </>
      ),
    },
  ];

  const CustomButton = () => (
    <Button
      style={{
        color: "#ffffff",
        backgroundColor: "#007bff",
        borderRadius: "5px",
        padding: "10px 20px",
      }}
      onClick={showModal} // Corrigido: apenas chama showModal
    >
      Novo
    </Button>
  );

  return (
    <InnerLayout title="Gerenciar Autores" extra={<CustomButton />}>
      <Table
        columns={columns}
        dataSource={data}
        locale={{ emptyText: "Nenhum autor cadastrado" }}
        rowKey="id"
      />
      
      {/* Renderiza o modal como componente JSX */}
      <Caixa 
        isModalOpen={isModalOpen} 
        handleOk={handleOk} 
        handleCancel={handleCancel} 
        tipo={1}
      />
    </InnerLayout>
  );
}