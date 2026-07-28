const ConfigSection = ({ titulo, descripcion, children }) => {
  return (
    <section className="config-section">
      <div className="config-section-header">
        <h2>{titulo}</h2>
        {descripcion && <p>{descripcion}</p>}
      </div>

      <div className="config-section-content">
        {children}
      </div>
    </section>
  );
};

export default ConfigSection;