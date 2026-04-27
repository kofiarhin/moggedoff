function InlineAlert({ title = 'Something needs attention', message }) {
  return (
    <div
      className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-950"
      role="alert"
    >
      <p className="font-semibold">{title}</p>
      {message ? <p className="mt-1 text-rose-800">{message}</p> : null}
    </div>
  )
}

export default InlineAlert
