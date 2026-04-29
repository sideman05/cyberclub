export default function FormInput({ label, error, className = '', ...props }) {
  return (
    <label className={`admin-field ${className}`}>
      <span>{label}</span>
      <input className={error ? 'has-error' : ''} {...props} />
      {error && <small>{error}</small>}
    </label>
  );
}
