export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="admin-state admin-error-state">
      <h3>{message}</h3>
      {onRetry && (
        <button className="admin-button admin-button-secondary" type="button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
