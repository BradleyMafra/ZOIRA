import React from "react";

const statusMap = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em andamento",
  CLOSED: "Fechado",
};

const StatusBadge = ({ status }) => {
  const label = statusMap[status] || status;
  return <span className={`badge badge-${status?.toLowerCase()}`}>{label}</span>;
};

export default StatusBadge;
