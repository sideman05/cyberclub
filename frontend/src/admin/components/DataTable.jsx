import EmptyState from './EmptyState.jsx';
import LoadingState from './LoadingState.jsx';

export default function DataTable({
  columns,
  rows,
  rowKey = 'id',
  loading = false,
  emptyTitle = 'No records found',
}) {
  if (loading) {
    return <LoadingState />;
  }

  if (!rows.length) {
    return <EmptyState title={emptyTitle} />;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]}>
              {columns.map((column) => (
                <td key={`${row[rowKey]}-${column.header}`}>
                  {column.render ? column.render(row) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
