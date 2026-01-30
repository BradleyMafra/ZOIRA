import React from "react";

const FormField = ({ label, children, required }) => (
  <label className="form-field">
    <span>
      {label}
      {required && <strong>*</strong>}
    </span>
    {children}
  </label>
);

export default FormField;
