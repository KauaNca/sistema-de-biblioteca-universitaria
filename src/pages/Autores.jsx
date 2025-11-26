import { Table, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

export default function Autores() {

  const data = [];

  const columns = [
    {
      title: "Nome",
      dataIndex: "nome",
    },
    {
      title: "Nacionalidade",
      dataIndex: "nacionalidade",
    },
    {
      title: "Data de Nascimento",
      dataIndex: "dataNascimento",
    },
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

  return (
    <div style={{ background: "white", padding: 20, borderRadius: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h2>Gerenciar Autores</h2>

        <Button type="primary" icon={<PlusOutlined />}>
          Novo Autor
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        locale={{ emptyText: "Nenhum autor cadastrado" }}
        rowKey="id"
      />
    </div>
  );
}
