import React from "react";

const MessageList = ({ messages = [] }) => {
  if (!messages.length) {
    return <p className="empty-state">Nenhuma mensagem registrada.</p>;
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message-card message-${message.author_type?.toLowerCase()}`}
        >
          <div>
            <strong>{message.author_type === "ADMIN" ? "TI" : "Usuário"}</strong>
            <span>{new Date(message.created_at).toLocaleString()}</span>
          </div>
          <p>{message.message}</p>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
