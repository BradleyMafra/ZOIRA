import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge.jsx";
import FormField from "../components/FormField.jsx";
import { getAdminPassword, listTickets, logout } from "../services/api.js";

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    setor: "",
    search: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadTickets = async () => {
    if (!getAdminPassword()) {
      navigate("/admin/login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await listTickets(
        Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value)
        )
      );
      setTickets(data.tickets);
    } catch (err) {
      if (err.message.toLowerCase().includes("not authorized")) {
        navigate("/admin/login");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilter = (event) => {
    event.preventDefault();
    loadTickets();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Tickets recebidos</h2>
          <p className="muted">
            Filtre por status, setor ou nome/máquina. Ordenação: mais recentes
            primeiro.
          </p>
        </div>
        <button className="button button-secondary" onClick={handleLogout}>
          Sair
        </button>
      </div>

      <form className="form filters" onSubmit={handleFilter}>
        <FormField label="Status">
          <select name="status" value={filters.status} onChange={handleChange}>
            <option value="">Todos</option>
            <option value="OPEN">Aberto</option>
            <option value="IN_PROGRESS">Em andamento</option>
            <option value="CLOSED">Fechado</option>
          </select>
        </FormField>
        <FormField label="Setor">
          <input
            type="text"
            name="setor"
            value={filters.setor}
            onChange={handleChange}
          />
        </FormField>
        <FormField label="Buscar">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Nome ou máquina"
          />
        </FormField>
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Carregando" : "Filtrar"}
        </button>
      </form>

      {error && <p className="alert alert-error">{error}</p>}

      <div className="table">
        <div className="table-header">
          <span>ID</span>
          <span>Nome</span>
          <span>Máquina</span>
          <span>Setor</span>
          <span>Status</span>
          <span>Prioridade</span>
          <span>Criado em</span>
          <span>Ações</span>
        </div>
        {tickets.map((ticket) => (
          <div className="table-row" key={ticket.id}>
            <span>#{ticket.id}</span>
            <span>{ticket.nome}</span>
            <span>{ticket.maquina}</span>
            <span>{ticket.setor}</span>
            <span>
              <StatusBadge status={ticket.status} />
            </span>
            <span className={`priority-${ticket.priority?.toLowerCase()}`}>
              {ticket.priority}
            </span>
            <span>{new Date(ticket.created_at).toLocaleString()}</span>
            <span>
              <Link className="link" to={`/admin/ticket/${ticket.id}`}>
                Ver detalhes
              </Link>
            </span>
          </div>
        ))}
        {!tickets.length && !loading && (
          <p className="empty-state">Nenhum ticket encontrado.</p>
        )}
      </div>
    </section>
  );
};

export default AdminDashboard;
