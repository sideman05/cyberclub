export default function LoadingState({ label = 'Loading data...' }) {
  return (
    <div className="admin-state">
      <span className="admin-spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}
