export default function Textarea({ label, error, className = '', rows = 5, ...props }) {
  return (
    <label className={`admin-field ${className}`}>
      <span>{label}</span>
      <textarea className={error ? 'has-error' : ''} rows={rows} {...props} />
      {error && <small>{error}</small>}
    </label>
  );
}
