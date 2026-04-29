export default function StatusBadge({ status }) {
  const value = String(status || 'unknown').toLowerCase();

  return (
    <span className={`admin-status admin-status-${value.replace(/\s+/g, '-')}`}>
      {value}
    </span>
  );
}
