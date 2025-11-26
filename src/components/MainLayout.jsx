import React, { useState, useEffect } from "react";
import Botao from './Button';
import { Link, Outlet } from "react-router-dom";
import { Layout, Menu, Drawer, Button, Space, Row, Col } from "antd";
import {
  MenuOutlined,
  ReadOutlined,
  TeamOutlined,
  BarChartOutlined
} from "@ant-design/icons";


const { Header, Footer, Content } = Layout;

const MainLayout = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const iconHeaderStyle = { fontSize: "2rem", marginRight: "8px" };


  // Menu principal (Navegação)
  const mainMenuItems = [
    {
      key: "1",
      label: <Link to="/livros"><ReadOutlined /> Livros</Link>,
    },
    {
      key: "2",
      label: <Link to="/autores"> <TeamOutlined /> Autores</Link>,
    },
    {
      key: "3",
      label: <Link to="/alunos">Alunos</Link>,
    },
    {
      key: "4",
      label: <Link to="/relatorios"> <BarChartOutlined /> Relatórios</Link>,
    },
  ];


  return (
    <Layout style={{ minHeight: "100vh", overflowX: "hidden" }}>
      <Header
        style={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
          color: "black",
          height: "auto",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 5px",
            width: "auto",
            fontWeight: "bold",
            fontSize: "18px",
            textDecoration: "none",
            color: "black",
            borderBottom: "1px solid #ccc",
          }}
        >
          <ReadOutlined style={iconHeaderStyle} />
          <span className="text-sm md: text-lg">
            Sistema De Biblioteca Universitária
          </span>
        </Link>
        {/* LAYOUT DESKTOP */}
        {!isMobile && (
          <>
            <div
              style={{
                display: "block",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                width: "auto",
                borderBottom: "1px solid #ccc",
              }}
            >
              {/* Menu Principal - CENTRO */}
              <Menu
                mode="horizontal"
                items={mainMenuItems}
                style={{
                  backgroundColor: "transparent",
                  width: "auto",
                  fontSize: "1rem",
                }}
              />
            </div>
          </>
        )}

        {/* LAYOUT MOBILE */}
        {isMobile && (
          <Space>
            {/* Botão do Menu Hamburguer */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
            />
          </Space>
        )}
      </Header>

      {/* DRAWER PARA MOBILE */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <Menu
          mode="vertical"
          items={mainMenuItems}
          onClick={() => setDrawerVisible(false)} // Fecha drawer ao clicar
        />
      </Drawer>

      <Content
        style={{
          minHeight: "calc(100vh - 128px)",
          padding: 24,
          border: "1px solid #ccc",
        }}
      >

        <Outlet />
      </Content>

      <Footer className="bg-gray-800 py-8 px-4 text-white">
        <div className="max-w-6xl mx-auto">
          {/* Links de Navegação */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-6">
            <Link
              to="/privacy"
              className="hover:text-green-400 transition-colors duration-200"
            >
              Política de Privacidade
            </Link>
            <Link
              to="/terms"
              className="hover:text-green-400 transition-colors duration-200"
            >
              Termos de Serviço
            </Link>
            <Link
              to="/contact"
              className="hover:text-green-400 transition-colors duration-200"
            >
              Contato
            </Link>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-600 my-6 w-full max-w-xs mx-auto"></div>

          {/* Informações da Empresa */}
          <div className="text-center text-gray-300">
            <p className="mb-2">
              71080-020 | CNPJ: 74.707.730/0001-63 • Ceilândia, Brasília-DF
            </p>
            <p className="text-sm">
              Sistema de Biblioteca Universitária© {new Date().getFullYear()} • Created by IFB Team
            </p>
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default MainLayout;
