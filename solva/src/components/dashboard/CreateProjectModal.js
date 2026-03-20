"use client"

import { useState, useRef, useEffect } from "react"

export default function CreateProjectModal({ onClose, onCreate }) {
  const [projectName, setProjectName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  const nameRef = useRef(null)

  const handleSubmit = async () => {
    if (!projectName.trim()) return alert("Enter project name")
    if (!clientEmail.includes("@")) return alert("Enter valid email")
    if (!amount || isNaN(amount)) return alert("Enter valid amount")

    setLoading(true)
    const slug = Math.random().toString(36).substring(2, 10)

    const { error } = await onCreate({
      project_name: projectName,
      client_email: clientEmail,
      invoice_amount: amount,
      portal_slug: slug,
      status: "awaiting_payment",
    })

    setLoading(false)
    if (error) {
      alert("Error creating project")
      return
    }
    onClose()
  }

  useEffect(() => {
    nameRef.current?.focus()
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
        className="card w-full max-w-md px-6 py-5 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-[color:var(--foreground)]">
            New project
          </h2>
          <p className="text-xs text-[color:var(--muted)]">
            Set the invoice and client. Files will stay locked until payment.
          </p>
        </div>

        <div className="space-y-4">
          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[color:var(--foreground)]">
              Project name
            </label>
            <input
              ref={nameRef}
              placeholder="Brand assets delivery"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="input bg-[color:var(--surface)]"
            />
          </div>

          {/* Client Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[color:var(--foreground)]">
              Client email
            </label>
            <input
              placeholder="client@company.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="input bg-[color:var(--surface)]"
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[color:var(--foreground)]">
              Amount (₹)
            </label>
            <input
              placeholder="50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input bg-[color:var(--surface)]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          {/* Cancel Button */}
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost text-xs"
          >
            Cancel
          </button>
          {/* Create Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-xs"
          >
            {loading ? "Creating…" : "Create project"}
          </button>
        </div>
      </form>
    </div>
  )
}