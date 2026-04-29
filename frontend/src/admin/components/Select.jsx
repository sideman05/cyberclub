export default function Select({ label, error, children, className = '', ...props }) {
  return (
    <label className={`admin-field ${className}`}>
      <span>{label}</span>
      <select className={error ? 'has-error' : ''} {...props}>
        {children}
      </select>
      {error && <small>{error}</small>}
    </label>
  );
}
