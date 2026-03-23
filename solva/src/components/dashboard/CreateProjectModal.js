"use client"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Lock } from "lucide-react"

/*
  Solva brand palette (same constants as DashboardCard).
  Defined locally so this file is fully self-contained.
*/
const BRAND = {
  p50:  "#EEEDFE",
  p400: "#7F77DD",
  p600: "#534AB7",
  p900: "#26215C",
  u50:  "#E1F5EE",
  u400: "#1D9E75",
  l50:  "#F1EFE8",
  l400: "#888780",
  l900: "#2C2C2A",
  surface: "#FAFAF8",
  border:  "#E2E0DA",
  card:    "#FFFFFF",
}

/* ─────────────────────────────────────────────────────────────────
   CreateProjectModal
   A controlled action layer — not a popup.
   Scrim: dark, absorbs focus.
   Panel: white, structured, calm.
───────────────────────────────────────────────────────────────── */
export default function CreateProjectModal({ onClose, onCreate }) {
  const [projectName, setProjectName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [amount, setAmount]           = useState("")
  const [loading, setLoading]         = useState(false)
  const nameRef = useRef(null)

  const handleSubmit = async () => {
    if (!projectName.trim())        return alert("Enter project name")
    if (!clientEmail.includes("@")) return alert("Enter valid email")
    if (!amount || isNaN(amount))   return alert("Enter valid amount")
    setLoading(true)
    const slug = Math.random().toString(36).substring(2, 10)
    const { error } = await onCreate({
      project_name:   projectName,
      client_email:   clientEmail,
      invoice_amount: amount,
      portal_slug:    slug,
      status:         "awaiting_payment",
    })
    setLoading(false)
    if (error) { alert("Error creating project"); return }
    onClose()
  }

  useEffect(() => {
    nameRef.current?.focus()
    const handleEsc = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  return (
    /* ── Scrim — darker than before (0.5 → feels more intentional) ── */
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(20,18,16,0.55)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      {/* ── Modal panel ────────────────────────────────────────────── */}
      <motion.div
        className="relative w-full max-w-[420px] rounded-xl overflow-hidden"
        style={{
          background: BRAND.card,
          border: `1px solid ${BRAND.border}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.08)",
        }}
        initial={{ opacity: 0, scale: 0.975, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.975, y: 8 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Close ─────────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-lg transition-colors focus-ring"
          style={{ color: BRAND.l400 }}
          onMouseEnter={e => { e.currentTarget.style.background = BRAND.l50; e.currentTarget.style.color = BRAND.l900 }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = BRAND.l400 }}
        >
          <X size={14} strokeWidth={1.75} />
        </button>

        {/* ── Modal header ───────────────────────────────────────────── */}
        <div
          className="px-6 pt-6 pb-5"
          style={{ borderBottom: `1px solid ${BRAND.border}` }}
        >
          {/*
            Lock icon: brand warm surface, not white.
            Matches the "locked state" visual language from the brand doc.
          */}
          <div
            className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: BRAND.l50, border: `1px solid ${BRAND.border}` }}
          >
            <Lock size={13} strokeWidth={1.75} style={{ color: BRAND.l400 }} />
          </div>

          <h2
            className="text-[14px] leading-snug"
            style={{ fontWeight: 500, color: BRAND.l900, letterSpacing: "-0.01em" }}
          >
            New project
          </h2>
          <p className="mt-1 text-[11px] leading-relaxed" style={{ color: BRAND.l400 }}>
            Set the invoice and client. Files will stay locked until payment.
          </p>
        </div>

        {/* ── Form ───────────────────────────────────────────────────── */}
        <form
          onSubmit={e => { e.preventDefault(); handleSubmit() }}
          className="px-6 py-5 space-y-4"
        >
          <Field label="Project name">
            <input
              ref={nameRef}
              placeholder="Brand assets delivery"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              className="input-solva"
            />
          </Field>

          <Field label="Client email">
            <input
              type="email"
              placeholder="client@company.com"
              value={clientEmail}
              onChange={e => setClientEmail(e.target.value)}
              className="input-solva"
            />
          </Field>

          <Field label="Amount (₹)">
            <input
              placeholder="50000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="input-solva"
            />
          </Field>

          {/* ── Actions ─────────────────────────────────────────────── */}
          <div
            className="flex items-center justify-end gap-2.5 pt-4"
            style={{ borderTop: `1px solid ${BRAND.border}` }}
          >
            {/* Cancel — lowest visual weight */}
            <button
              type="button" onClick={onClose}
              className="rounded-lg px-4 py-[7px] text-[11px] transition-all duration-150 active:scale-[0.97] focus-ring"
              style={{ border: `1px solid ${BRAND.border}`, background: "transparent", color: BRAND.l400, fontWeight: 500 }}
              onMouseEnter={e => { e.currentTarget.style.background = BRAND.l50; e.currentTarget.style.color = BRAND.l900 }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = BRAND.l400 }}
            >
              Cancel
            </button>

            {/*
              Primary CTA: Solva 400 → 600 on hover.
              Weight 500 — brand says no heavy weights.
              "Create project" = decisive, one action, one outcome.
            */}
            <button
              type="submit" disabled={loading}
              className="rounded-lg px-4 py-[7px] text-[11px] text-white transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed focus-ring"
              style={{ background: BRAND.p400, fontWeight: 500 }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = BRAND.p600 }}
              onMouseLeave={e => { e.currentTarget.style.background = BRAND.p400 }}
            >
              {loading ? "Creating…" : "Create project"}
            </button>
          </div>
        </form>
      </motion.div>

      {/*
        Inline style injection for input-solva class.
        Keeps inputs consistent without requiring CSS file changes.
        Uses brand Locked 50 surface (#F1EFE8) and warm border.
      */}
      <style>{`
        .input-solva {
          display: block;
          width: 100%;
          border-radius: 8px;
          border: 1px solid ${BRAND.border};
          background: ${BRAND.l50};
          padding: 7px 12px;
          font-size: 12px;
          color: ${BRAND.l900};
          font-weight: 400;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input-solva::placeholder {
          color: ${BRAND.l400};
        }
        .input-solva:focus {
          border-color: ${BRAND.p400};
          box-shadow: 0 0 0 3px ${BRAND.p50};
        }
      `}</style>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Field — label + input wrapper
───────────────────────────────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label
        className="block text-[11px]"
        style={{ fontWeight: 500, color: BRAND.l900, letterSpacing: "0.01em" }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}