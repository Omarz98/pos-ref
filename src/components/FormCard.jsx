function FormCard({ title, children, buttonText, onSubmit }) {
  return (
    <aside className="cart-panel">
      <h2>{title}</h2>

      <div className="form-content">
        {children}
      </div>

      <button className="btn-primary" onClick={onSubmit}>
        {buttonText}
      </button>
    </aside>
  );
}

export default FormCard;