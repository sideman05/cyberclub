export default function EmptyState({ title = 'No records yet', action = null }) {
  return (
    <div className="admin-state admin-empty">
      <h3>{title}</h3>
      {action}
    </div>
  );
}
