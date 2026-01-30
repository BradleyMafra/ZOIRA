import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "../components/FormField.jsx";
import { createTicket } from "../services/api.js";

const initialForm = {
  nome: "",
  maquina: "",
  setor: "",
  descricao: "",
  contato: "",
};

const OpenTicket = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");
  const [lookupId, setLookupId] = useState("");
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);
    try {
      const result = await createTicket(form);
      setSuccess(result);
      setForm(initialForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = (event) => {
    event.preventDefault();
    if (lookupId.trim()) {
      navigate(`/ticket/${lookupId}`);
    }
  };

  return (
    <div className="page-grid">
      <section className="card">
        <h2>Abrir um chamado</h2>
        <p className="muted">
          Preencha os campos abaixo para registrar o seu chamado. Entraremos em
          contato o quanto antes.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <FormField label="Nome" required>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Máquina" required>
            <input
              type="text"
              name="maquina"
              value={form.maquina}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Setor" required>
            <input
              type="text"
              name="setor"
              value={form.setor}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Descrição" required>
            <textarea
              name="descricao"
              rows="4"
              value={form.descricao}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Telefone / WhatsApp">
            <input
              type="text"
              name="contato"
              value={form.contato}
              onChange={handleChange}
            />
          </FormField>

          {error && <p className="alert alert-error">{error}</p>}
          {success && (
            <div className="alert alert-success">
              <p>Chamado aberto com sucesso!</p>
              <p>
                Ticket ID: <strong>{success.id}</strong>
              </p>
              <p>
                Chave de acesso: <strong>{success.accessKey}</strong>
              </p>
            </div>
          )}

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Abrir ticket"}
          </button>
        </form>
      </section>

      <section className="card">
        <h3>Consultar ticket</h3>
        <p className="muted">
          Já abriu um chamado? Digite o número do ticket para acompanhar o
          status.
        </p>
        <form className="form" onSubmit={handleLookup}>
          <FormField label="Ticket ID" required>
            <input
              type="number"
              value={lookupId}
              onChange={(event) => setLookupId(event.target.value)}
              required
            />
          </FormField>
          <button className="button button-secondary" type="submit">
            Consultar
          </button>
        </form>
      </section>
    </div>
  );
};

export default OpenTicket;
