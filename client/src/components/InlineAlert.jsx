function InlineAlert({ title = 'Something needs attention', message }) {
  return (
    <div
      className="rounded-lg border border-rose-500/30 bg-rose-950/30 px-4 py-3 text-sm text-rose-100"
      role="alert"
    >
      <p className="font-semibold">{title}</p>
      {message ? <p className="mt-1 text-rose-200">{message}</p> : null}
    </div>
  )
}

export default InlineAlert
