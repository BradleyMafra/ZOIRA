import React, { useState } from "react";
import { useParams } from "react-router-dom";
import MessageList from "../components/MessageList.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import FormField from "../components/FormField.jsx";
import { getTicket, addUserMessage } from "../services/api.js";

const TicketDetail = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [accessKey, setAccessKey] = useState("");

  const loadTicket = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await getTicket(id);
      setTicket(data.ticket);
      setMessages(data.messages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadTicket();
  }, [id]);

  const handleAddMessage = async (event) => {
    event.preventDefault();
    if (!note.trim()) return;
    setError("");
    try {
      await addUserMessage(id, { message: note, accessKey });
      setNote("");
      await loadTicket();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <p className="loading">Carregando ticket...</p>;
  }

  if (error) {
    return <p className="alert alert-error">{error}</p>;
  }

  if (!ticket) {
    return null;
  }

  return (
    <div className="card">
      <div className="ticket-header">
        <div>
          <h2>Ticket #{ticket.id}</h2>
          <p className="muted">
            Criado em {new Date(ticket.created_at).toLocaleString()}
          </p>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

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
          <strong>Prioridade</strong>
          <span>{ticket.priority}</span>
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

      <section>
        <h3>Mensagens</h3>
        <MessageList messages={messages} />
      </section>

      <section className="card-section">
        <h3>Adicionar mensagem</h3>
        <form className="form" onSubmit={handleAddMessage}>
          <FormField label="Mensagem">
            <textarea
              rows="3"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </FormField>
          <FormField label="Chave de acesso">
            <input
              type="text"
              value={accessKey}
              onChange={(event) => setAccessKey(event.target.value)}
            />
          </FormField>
          <button className="button" type="submit">
            Enviar mensagem
          </button>
        </form>
      </section>
    </div>
  );
};

export default TicketDetail;
