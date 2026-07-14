import { useEffect, useState } from "react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const paginatedData = data.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }

    return pages;
  };
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
            {paginatedData.map((item) => (
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
      <div className="table-footer">
        <div className="table-info">
          Mostrando {data.length === 0 ? 0 : startIndex + 1} -
          {Math.min(endIndex, data.length)} de {data.length} registros
        </div>

        <div className="rows-selector">
          <span>Mostrar</span>

          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>

          <span>registros</span>
        </div>

        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            ←
          </button>

          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span key={index} className="dots">
                ...
              </span>
            ) : (
              <button
                key={index}
                className={currentPage === page ? "active" : ""}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ),
          )}

          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
