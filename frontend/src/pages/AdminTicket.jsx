import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MessageList from "../components/MessageList.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import FormField from "../components/FormField.jsx";
import {
  getAdminPassword,
  getAdminTicket,
  addAdminMessage,
  updateTicket,
} from "../services/api.js";

const AdminTicket = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadTicket = async () => {
    if (!getAdminPassword()) {
      navigate("/admin/login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await getAdminTicket(id);
      setTicket(data.ticket);
      setMessages(data.messages);
      setStatus(data.ticket.status);
      setPriority(data.ticket.priority);
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
    loadTicket();
  }, [id]);

  const handleMessage = async (event) => {
    event.preventDefault();
    if (!note.trim()) return;
    setError("");
    try {
      await addAdminMessage(id, { message: note });
      setNote("");
      await loadTicket();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async () => {
    setError("");
    try {
      await updateTicket(id, { status, priority });
      await loadTicket();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <p className="loading">Carregando ticket...</p>;
  }

  if (!ticket) {
    return null;
  }

  return (
    <section className="card">
      <div className="ticket-header">
        <div>
          <h2>Ticket #{ticket.id}</h2>
          <p className="muted">
            Aberto em {new Date(ticket.created_at).toLocaleString()}
          </p>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      {error && <p className="alert alert-error">{error}</p>}

      <div className="ticket-info">
        <div>
          <strong>Nome</strong>
          <span>{ticket.nome}</span>
        </div>
        <div>
          <strong>Máquina</strong>
          <span>{ticket.maquina}</span>
        </div>
        <div>
          <strong>Setor</strong>
          <span>{ticket.setor}</span>
        </div>
        <div>
          <strong>Contato</strong>
          <span>{ticket.contato || "-"}</span>
        </div>
      </div>

      <div className="ticket-description">
        <strong>Descrição</strong>
        <p>{ticket.descricao}</p>
      </div>

      <div className="timeline">
        <div>
          <strong>Atualizado em</strong>
          <span>{new Date(ticket.updated_at).toLocaleString()}</span>
        </div>
        {ticket.closed_at && (
          <div>
            <strong>Fechado em</strong>
            <span>{new Date(ticket.closed_at).toLocaleString()}</span>
          </div>
        )}
      </div>

      <section className="card-section">
        <h3>Atualizar status e prioridade</h3>
        <div className="form split">
          <FormField label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="OPEN">Aberto</option>
              <option value="IN_PROGRESS">Em andamento</option>
              <option value="CLOSED">Fechado</option>
            </select>
          </FormField>
          <FormField label="Prioridade">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
            </select>
          </FormField>
        </div>
        <button className="button" onClick={handleUpdate}>
          Salvar alterações
        </button>
      </section>

      <section className="card-section">
        <h3>Mensagens</h3>
        <MessageList messages={messages} />
      </section>

      <section className="card-section">
        <h3>Responder</h3>
        <form className="form" onSubmit={handleMessage}>
          <FormField label="Mensagem">
            <textarea
              rows="3"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </FormField>
          <button className="button" type="submit">
            Enviar resposta
          </button>
        </form>
      </section>
    </section>
  );
};

export default AdminTicket;
