import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import CatalogView from "./views/CatalogView";
import FormuladorView from "./views/FormuladorView";
import HistoricoView from "./views/HistoricoView";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/catalogo" replace />} />
        <Route path="/catalogo" element={<CatalogView />} />
        <Route path="/formulador" element={<FormuladorView />} />
        <Route path="/formulador/:listId" element={<FormuladorView />} />
        <Route path="/historico" element={<HistoricoView />} />
      </Routes>
    </Layout>
  );
}