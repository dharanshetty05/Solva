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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
        className="bg-white rounded-xl p-6 w-full max-w-md space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">Create Project</h2>

        {/* Project Name */}
        <input
          ref={nameRef}
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="border p-2 w-full rounded"
        />

        {/* Client Email */}
        <input
          placeholder="Client Email"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          className="border p-2 w-full rounded"
        />

        {/* Amount */}
        <input
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 w-full rounded"
        />

        <div className="flex justify-end gap-2 pt-2">
          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="text-sm text-gray-500"
          >
            Cancel
          </button>
          {/* Create Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  )
}