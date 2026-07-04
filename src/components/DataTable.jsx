import { FaEdit, FaTrash } from "react-icons/fa";

function DataTable({
  title,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  columns,
  data,
  actions,
}) {
  return (
    <div className="products-panel">
      <div className="panel-header">
        <h2>{title}</h2>

        <input
          placeholder={searchPlaceholder || "Buscar..."}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              {actions && <th>Acciones</th>}
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                {columns.map((col) => (
                  <td key={col.key}>{item[col.key]}</td>
                ))}

                {actions && (
                  <td className="actions">
                    {actions.map((action, index) => (
                      <button
                        key={index}
                        className={action.className}
                        title={action.title}
                        onClick={() => action.onClick(item)}
                      >
                        {action.icon}
                      </button>
                    ))}
                  </td>
                )}
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1}>
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
