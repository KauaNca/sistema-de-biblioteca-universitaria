import { Table, Button, PageHeader } from "antd";
import { PlusOutlined } from "@ant-design/icons";

function Autores() {
  
  // Lista de autores — vazia por enquanto
  const data = [];

  const columns = [
    {
      title: "Nome",
      dataIndex: "nome",
      key: "nome",
    },
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
      key: "acoes",
      render: () => (
        <>
          <Button type="link">Editar</Button>
          <Button type="link" danger>Excluir</Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      
      {/* Cabeçalho */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h2>Gerenciar Autores</h2>

        <Button type="primary" icon={<PlusOutlined />}>
          Novo Autor
        </Button>
      </div>

      {/* Tabela */}
      <Table 
        columns={columns} 
        dataSource={data} 
        locale={{ emptyText: "Nenhum autor cadastrado" }}
        rowKey="id"
      />
    </div>
  );
}

export default Autores;
