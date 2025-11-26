import React from "react";
import { Table, Button, PageHeader, Card } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const AuthorsPage = () => {

  const columns = [
    { title: "Nome", dataIndex: "nome", key: "nome" },
    { title: "Nacionalidade", dataIndex: "nacionalidade", key: "nacionalidade" },
    { title: "Data de Nascimento", dataIndex: "dataNascimento", key: "dataNascimento" },
    { title: "Ações", key: "acoes", render: () => <span>—</span> }
  ];

  const data = []; // Nenhum autor cadastrado

  return (
    <>
      <PageHeader
        title="Gerenciar Autores"
        extra={[
          <Button
            type="primary"
            icon={<PlusOutlined />}
            key="1"
            style={{
              backgroundColor: "#0a1128",
              borderColor: "#0a1128",
              height: 40,
              padding: "0 20px",
              fontWeight: 500
            }}
          >
            Novo Autor
          </Button>
        ]}
      />

      <Card title="Lista de Autores">
        <Table
          columns={columns}
          dataSource={data}
          locale={{ emptyText: "Nenhum autor cadastrado" }}
          pagination={false}
          rowKey="id"
        />
      </Card>
    </>
  );
};

export default Autores;
