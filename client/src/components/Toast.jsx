export default function Toast({ toast }) {
  if (!toast) return null
  return (
    <div key={toast.id} className={`toast toast--${toast.tone}`} role="status" aria-live="polite">
      <span className="toast__dot" />
      {toast.message}
    </div>
  )
}
