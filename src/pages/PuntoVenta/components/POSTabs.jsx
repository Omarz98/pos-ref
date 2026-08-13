export default function POSTabs({ tab, onChange, items }) {
  return (
    <div className="pos-tabs" role="tablist">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={tab === item.id}
          className={`pos-tab ${
            tab === item.id ? "active" : ""
          }`}
          onClick={() => onChange(item.id)}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}
