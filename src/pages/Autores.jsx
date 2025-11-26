import React from "react";
import { Table, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import InnerLayout from "../components/InnerLayout";

export default function Autores() {
  const data = [
    { id: 1, nome: "Autor 1", nacionalidade: "Brasileira", dataNascimento: "20/03/2001" },
    { id: 2, nome: "Autor 2", nacionalidade: "Mexicana", dataNascimento: "20/02/2002" },
  ];
  const columns = [
    { title: "Nome", dataIndex: "nome", key: "nome" },
    { title: "Nacionalidade", dataIndex: "nacionalidade", key: "nacionalidade" },
    { title: "Data de Nascimento", dataIndex: "dataNascimento", key: "dataNascimento" },
    {
      title: "Ações",
      render: () => (
        <>
          <Button type="link">Editar</Button>
          <Button type="link" danger>Excluir</Button>
        </>
      ),
    },
  ];

  // Botão personalizado conforme seu JSON
  const CustomButton = () => (
    <Button
      style={{
        color: "#ffffff",
        backgroundColor: "#007bff",
        borderRadius: "5px",
        padding: "10px 20px",
      }}
      onClick={() => alert("Enviar clicado!")}
    >
      Enviar
    </Button>
  );

  return (
    <InnerLayout
      title="Gerenciar Autores"
      extra={<CustomButton />}
    >
      <Table
        columns={columns}
        dataSource={data}
        locale={{ emptyText: "Nenhum autor cadastrado" }}
        rowKey="id"
      />
    </InnerLayout>
  );
}