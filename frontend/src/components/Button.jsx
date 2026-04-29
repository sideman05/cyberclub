import { ArrowRight } from 'lucide-react';

export default function Button({ children, to = '#', variant = 'primary', className = '', icon = true }) {
  return (
    <a className={`button button-${variant} ${className}`} href={to}>
      <span>{children}</span>
      {icon && <ArrowRight size={18} strokeWidth={2.5} />}
    </a>
  );
}
