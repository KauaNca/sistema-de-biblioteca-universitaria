import React from "react";
import { Layout, Card, Button } from "antd";

const { Header, Content } = Layout;

/**
 * InnerLayout Reutilizável
 * @param {string} title - Título do header
 * @param {React.ReactNode} children - Conteúdo interno (ex: tabelas)
 * @param {React.ReactNode} extra - Botão ou ação extra
 */
export default function InnerLayout({ title, children, extra }) {
  return (
    <Layout style={{ background: "transparent" }}>
      <Header
        style={{
          background: "transparent",
          padding: 0,
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p className="text-lg font-bold">{title}</p>
        {extra}
      </Header>

      <Content>
        <Card>{children}</Card>
      </Content>
    </Layout>
  );
}
