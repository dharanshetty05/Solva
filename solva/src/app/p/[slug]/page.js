"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Lock } from "lucide-react"
import { useParams, useSearchParams } from "next/navigation"

export default function PortalPage() {
  const { slug } = useParams()
  const searchParams = useSearchParams()
  const mockPayment = searchParams.get("mock_payment")

  const [project, setProject] = useState(null)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [isPaying, setIsPaying] = useState(false)
  const [payError, setPayError] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/projects/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })

      const data = await res.json()

      if (!data.project) {
        setLoading(false)
        return
      }

      setProject(data.project)
      setFiles(data.files || [])
      setLoading(false)
    }

    if (slug) fetchData()
  }, [slug])

  useEffect(() => {
    if (mockPayment && project) {
      fetch("/api/mock/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      }).then(() => {
        window.location.href = `/p/${project.portal_slug}`
      })
    }
  }, [mockPayment, project])

  const handlePay = async () => {
    if (isPaying) return
    setPayError(null)
    setIsPaying(true)

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        body: JSON.stringify({ projectId: project.id }),
      })

      const data = await res.json()
      window.location.href = data.url
    } catch (e) {
      setPayError("Could not start payment. Please try again.")
      setIsPaying(false)
    }
  }

  const isUnlocked = Boolean(project?.paid_at)
  const invoiceAmount = Number(project?.invoice_amount || 0)
  const freelancerName =
    project?.freelancer_name || project?.creator_name || "Freelancer"
  const freelancerLogoUrl =
    project?.freelancer_logo_url || project?.creator_logo_url || null
  const projectName = project?.project_name || "Project"

  const formatINR = (value) =>
    `₹${Number(value || 0).toLocaleString()}`

  const formatFileSizeKB = (bytes) =>
    `${(Number(bytes || 0) / 1024).toFixed(1)} KB`

  if (loading) return null

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Project not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-10 pb-24">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header */}
        <header className="card p-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-[color:var(--primary)] overflow-hidden">
              {freelancerLogoUrl ? (
                <img src={freelancerLogoUrl} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white font-bold">
                  S
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-bold">{freelancerName}</p>
              <p className="text-xs text-[color:var(--muted)]">{projectName}</p>

              <p className="text-xs text-[color:var(--muted)] mt-1">
                Prepared for {project.client_email || "Client"}
              </p>

              <p className="text-[11px] text-[color:var(--muted)]">
                Final delivery via secure link
              </p>
            </div>
          </div>
        </header>

        {/* Files */}
        <section className="card p-6">
          <h2 className="text-sm font-semibold">Files</h2>

          <div className="mt-4 space-y-3">
            {files.map((file) => (
              <div key={file.id} className="p-4 border rounded-xl">

                <div className="space-y-1">
                  <div className={!isUnlocked ? "blur-sm" : ""}>
                    {file.file_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSizeKB(file.file_size)}
                  </div>
                </div>

                {!isUnlocked && (
                  <div className="mt-2 text-xs text-gray-500">
                    Locked until payment
                  </div>
                )}

                {isUnlocked && (
                  <button
                    onClick={async () => {
                      setIsDownloading(true)
                      try {
                        const res = await fetch("/api/files/download", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            projectId: project.id,
                            portalSlug: project.portal_slug,
                            fileId: file.id,
                          }),
                        })

                        const data = await res.json()

                        if (data.download_url) {
                          window.open(data.download_url, "_blank")
                        } else {
                          setDownloadError("Failed to generate download link.")
                        }
                      } catch {
                        setDownloadError("Download failed.")
                      } finally {
                        setIsDownloading(false)
                      }
                    }}
                    className="mt-3 w-full border rounded-xl py-2 text-sm"
                  >
                    Download
                  </button>
                )}
              </div>
            ))}
          </div>

          {downloadError && (
            <p className="text-red-500 text-xs mt-3">{downloadError}</p>
          )}
        </section>

        {/* Payment */}
        <section className="card p-6 space-y-4">
          <p className="text-xs text-[color:var(--muted)]">
            Complete payment to receive final deliverables from {freelancerName}.
          </p>

          <div className="flex justify-between">
            <span>Amount</span>
            <span className="text-xl font-semibold">
              {formatINR(invoiceAmount)}
            </span>
          </div>

          {!isUnlocked ? (
            <>
              <button
                onClick={handlePay}
                disabled={isPaying}
                className="w-full btn-primary py-3"
              >
                {isPaying
                  ? "Redirecting…"
                  : `Complete payment of ${formatINR(invoiceAmount)} to access files`}
              </button>

              <p className="text-xs text-center text-[color:var(--muted)]">
                Secure payment • Files unlock instantly • No login required
              </p>

              {payError && (
                <p className="text-red-500 text-xs">{payError}</p>
              )}
            </>
          ) : (
            <div className="text-green-600 text-sm">
              Payment confirmed. Files unlocked.
            </div>
          )}
        </section>

        <p className="text-center text-xs text-gray-400">
          Powered by Solva
        </p>
      </div>
    </div>
  )
}