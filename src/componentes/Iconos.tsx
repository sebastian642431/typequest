type P = { className?: string };

export function Corazon({ className = "", lleno = true }: P & { lleno?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.1 4.4 2.5.8-1.4 2.3-2.5 4.4-2.5 3.7 0 5.8 3.9 4.3 7.3C18.6 16.4 12 21 12 21z"
        fill={lleno ? "var(--color-rojo)" : "none"}
        stroke={lleno ? "var(--color-rojo)" : "#b7c3d6"}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Llama({ className = "", activa = true }: P & { activa?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 22c4.4 0 7.5-3 7.5-7.2 0-3.3-2-5.9-3.8-7.9-.4 1.9-1.5 3.2-2.7 3.6.4-3.4-1.2-6.4-3.8-8.5.1 3.3-1.6 5.3-3.3 7.3C4.6 11.7 4.5 13 4.5 14.8 4.5 19 7.6 22 12 22z"
        fill={activa ? "#ff8a3d" : "#c9d3e2"}
      />
      <path d="M12 22c-2 0-3.5-1.4-3.5-3.4 0-2 1.6-3.2 3-4.9.3 1.4 1.3 2.1 2 2.3.6.9 2 1.4 2 2.7C15.5 20.6 14 22 12 22z" fill={activa ? "#ffd166" : "#e3e9f2"} />
    </svg>
  );
}

export function Estrella({ className = "" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6-4.9-4.6 6.6-.8z" fill="#ffc53d" stroke="#e0a21a" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function Tilde({ className = "" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Candado({ className = "" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
    </svg>
  );
}

export function Cruz({ className = "" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function Repaso({ className = "" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.7M20 4v4.7h-4.7M20 12a8 8 0 0 1-13.7 5.6L4 15.3M4 20v-4.7h4.7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Medalla({ className = "" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M7 2h4l2 6H9zM13 2h4l-2 6h-4z" fill="#2c6bc0" />
      <circle cx="12" cy="15" r="6.5" fill="#ffc53d" stroke="#e0a21a" strokeWidth="1.5" />
      <path d="M12 11.6l1.1 2.2 2.4.3-1.8 1.7.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.7 2.4-.3z" fill="#fff6d6" />
    </svg>
  );
}

export function Corona({ className = "" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" fill="#ffc53d" stroke="#e0a21a" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Parlante({ className = "", activo = true }: P & { activo?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
      {activo ? (
        <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function Rayo({ className = "" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M13 2L4 14h6l-1 8 9-12h-6z" fill="#ff8a3d" stroke="#e2701f" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
