"use client";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="sk">
      <body style={{ fontFamily: "Arial, sans-serif", margin: 0 }}>
        <main style={{ margin: "0 auto", maxWidth: 640, padding: "96px 24px", textAlign: "center" }}>
          <h1 style={{ fontSize: 30, margin: 0 }}>Niečo sa nepodarilo</h1>
          <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.7, marginTop: 12 }}>
            Skúste stránku načítať znova. Ak problém pretrváva, vráťte sa neskôr.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ background: "#7a1955", border: 0, borderRadius: 6, color: "white", cursor: "pointer", marginTop: 20, padding: "10px 16px" }}
          >
            Skúsiť znova
          </button>
        </main>
      </body>
    </html>
  )
}
