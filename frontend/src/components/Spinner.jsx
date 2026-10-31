export default function Spinner({ size = 'sm', className = '' }) {
  return (
    <span
      className={`spinner${size === 'lg' ? ' spinner-lg' : ''} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
