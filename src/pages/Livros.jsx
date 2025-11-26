import React from "react";
import { Table, Button } from "antd";
import InnerLayout from "../components/InnerLayout";

export default function Livros() {
  const data = [
    { id: 1, titulo: "Livro A", autor: "Autor X", ano: 2021 },
    { id: 2, titulo: "Livro B", autor: "Autor Y", ano: 2020 },
  ];

  const columns = [
    { title: "Título", dataIndex: "titulo", key: "titulo" },
    { title: "Autor", dataIndex: "autor", key: "autor" },
    { title: "Ano", dataIndex: "ano", key: "ano" },
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
      title="Gerenciar Livros"
      extra={<CustomButton />}
    >
      <Table
        columns={columns}
        dataSource={data}
        locale={{ emptyText: "Nenhum livro cadastrado" }}
        rowKey="id"
      />
    </InnerLayout>
  );
}
