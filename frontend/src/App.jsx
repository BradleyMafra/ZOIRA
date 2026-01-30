import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import OpenTicket from "./pages/OpenTicket.jsx";
import TicketDetail from "./pages/TicketDetail.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminTicket from "./pages/AdminTicket.jsx";

const App = () => (
  <div className="app">
    <header className="app-header">
      <div>
        <h1>Support Ticket Panel</h1>
        <p>Abra chamados rapidamente e acompanhe o atendimento.</p>
      </div>
      <nav>
        <NavLink to="/" end>
          Abrir Ticket
        </NavLink>
        <NavLink to="/ticket/1">Consultar Ticket</NavLink>
        <NavLink to="/admin">Admin</NavLink>
      </nav>
    </header>

    <main className="app-content">
      <Routes>
        <Route path="/" element={<OpenTicket />} />
        <Route path="/ticket/:id" element={<TicketDetail />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/ticket/:id" element={<AdminTicket />} />
      </Routes>
    </main>

    <footer className="app-footer">
      <span>Suporte TI • Painel estático + API Node.js</span>
    </footer>
  </div>
);

export default App;
