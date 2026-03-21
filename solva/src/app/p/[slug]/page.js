"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Lock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useParams, useSearchParams } from "next/navigation"

export default function PortalPage() {
  const { slug } = useParams()
  const searchParams = useSearchParams();
  const mockPayment = searchParams.get("mock_payment");

  const [project, setProject] = useState(null)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [isPaying, setIsPaying] = useState(false)
  const [payError, setPayError] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState(null)

  useEffect(() => {
        async function fetchData() {
        // 1. Get project by slug
        const { data: projectData } = await supabase
            .from("projects")
            .select("*")
            .eq("portal_slug", slug)
            .single()

        if (!projectData) {
            setLoading(false)
            return
        }

        setProject(projectData)

        // 2. Get files for project
        const { data: filesData } = await supabase
            .from("files")
            .select("*")
            .eq("project_id", projectData.id)
            .order("created_at", { ascending: false })

        setFiles(filesData || [])
        setLoading(false)
        }

        if (slug) fetchData()
  }, [slug])

  // useEffect for mock payment
  useEffect(() => {
    if (mockPayment && project) {
      fetch("/api/mock/confirm-payment", {
        method: "POST",
        body: JSON.stringify({ projectId: project.id }),
      }).then(() => {
        window.location.href = `/p/${project.portal_slug}`;
      });
    }
  }, [mockPayment, project]);

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
  };

  const isUnlocked = Boolean(project?.paid_at)
  const invoiceAmount = Number(project?.invoice_amount || 0)
  const freelancerName =
    project?.freelancer_name ||
    project?.creator_name ||
    "Freelancer"
  const freelancerLogoUrl =
    project?.freelancer_logo_url ||
    project?.creator_logo_url ||
    null
  const projectName = project?.project_name || "Project"

  const formatINR = (value) =>
    `₹${Number(value || 0).toLocaleString()}`

  const formatFileSizeKB = (bytes) =>
    `${(Number(bytes || 0) / 1024).toFixed(1)} KB`

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--background)] px-4 py-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="h-7 w-44 rounded-xl bg-white/60 animate-pulse" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-2">
              <div className="card p-6">
                <div className="space-y-3">
                  <div className="h-4 w-28 rounded-xl bg-white/70 animate-pulse" />
                  <div className="h-8 w-52 rounded-xl bg-white/70 animate-pulse" />
                  <div className="h-10 w-full rounded-xl bg-white/70 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <div className="card p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="h-5 w-20 rounded-xl bg-white/70 animate-pulse" />
                  <div className="h-4 w-36 rounded-xl bg-white/70 animate-pulse" />
                </div>

                <div className="mt-4 space-y-3">
                  <div className="h-20 rounded-xl bg-white/70 animate-pulse" />
                  <div className="h-20 rounded-xl bg-white/70 animate-pulse" />
                  <div className="h-20 rounded-xl bg-white/70 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[color:var(--background)] flex items-center justify-center px-4 py-10">
        <div className="card w-full max-w-md p-8 text-center space-y-2">
          <p className="text-xs font-medium tracking-[0.14em] text-[color:var(--muted)] uppercase">
            Solva portal
          </p>
          <h1 className="text-base font-semibold text-[color:var(--foreground)]">
            Project not found
          </h1>
          <p className="text-sm text-[color:var(--muted)]">
            The link may be invalid or the project may have been removed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)] px-4 py-10 pb-24">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <header className="card p-6">
          <div className="flex items-start gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[color:var(--primary)]">
              {freelancerLogoUrl ? (
                <img
                  src={freelancerLogoUrl}
                  alt={`${freelancerName} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white font-bold">
                  S
                </div>
              )}
            </div>

            <div className="min-w-0 space-y-1">
              <div className="text-sm font-bold text-[color:var(--foreground)] truncate">
                {freelancerName}
              </div>
              <div className="text-xs text-[color:var(--muted)] truncate">
                {projectName}
              </div>
            </div>
          </div>
        </header>

        {/* Files Section */}
        <section className="card p-6" aria-label="Uploaded files">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-[color:var(--foreground)]">
              Files
            </h2>
            {!isUnlocked && (
              <span className="text-xs text-[color:var(--muted)]">
                Locked until payment
              </span>
            )}
          </div>

          {files.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-center">
              <p className="text-sm font-medium text-[color:var(--foreground)]">
                No files uploaded yet
              </p>
              <p className="text-xs text-[color:var(--muted)] mt-1">
                Your creator will add files here.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="relative rounded-xl border border-[color:var(--border)]/70 bg-[color:var(--surface)] px-4 py-3 overflow-hidden transition-colors hover:bg-[color:var(--card)]"
                >
                  <div className="space-y-1">
                    <motion.div
                      className={`text-sm font-semibold leading-relaxed ${
                        !isUnlocked ? "pointer-events-none select-none" : ""
                      }`}
                      initial={{ filter: "blur(8px)", opacity: 0.95 }}
                      animate={{
                        filter: isUnlocked ? "blur(0px)" : "blur(8px)",
                        opacity: 1,
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      style={{ color: isUnlocked ? "var(--foreground)" : "var(--locked-text)" }}
                    >
                      {file.file_name}
                    </motion.div>
                    <motion.div
                      className={`text-xs leading-relaxed ${
                        !isUnlocked ? "pointer-events-none select-none" : ""
                      }`}
                      initial={{ filter: "blur(8px)", opacity: 0.95 }}
                      animate={{
                        filter: isUnlocked ? "blur(0px)" : "blur(8px)",
                        opacity: 1,
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      style={{
                        color: isUnlocked ? "var(--muted)" : "var(--locked-text)",
                      }}
                    >
                      {formatFileSizeKB(file.file_size)}
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {!isUnlocked && (
                      <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-2 rounded-full border border-[color:var(--border)]/70 bg-white/70 px-3 py-1 text-[11px] font-semibold text-[color:var(--locked-text)]">
                          <Lock size={14} />
                          Locked until payment
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isUnlocked && (
                    <motion.button
                      disabled={isDownloading}
                      onClick={async () => {
                        setDownloadError(null)
                        if (isDownloading) return
                        setIsDownloading(true)
                        try {
                          const res = await fetch("/api/files/download", {
                            method: "POST",
                            body: JSON.stringify({ projectId: project.id }),
                          })

                          const data = await res.json()

                          if (data.files) {
                            data.files.forEach((f) => {
                              if (f.download_url) {
                                window.open(f.download_url, "_blank")
                              }
                            })
                          }
                        } catch (e) {
                          setDownloadError(
                            "Could not start download. Please try again."
                          )
                        } finally {
                          setIsDownloading(false)
                        }
                      }}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-[color:var(--border)] bg-white px-4 py-2 text-xs font-semibold text-[color:var(--primary)] transition-colors hover:bg-[color:var(--surface)] disabled:opacity-70 disabled:cursor-not-allowed focus-ring"
                    >
                      {isDownloading ? "Preparing…" : "Download"}
                    </motion.button>
                  )}
                </div>
              ))}
            </div>
          )}

          {downloadError && (
            <p className="mt-4 text-xs font-medium text-red-600">
              {downloadError}
            </p>
          )}
        </section>

        {/* Payment Section */}
        <section className="card p-6" aria-label="Payment">
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-[color:var(--foreground)]">
                {projectName}
              </h2>
              <p className="text-xs text-[color:var(--muted)]">
                Total amount
              </p>
            </div>

            <div className="flex items-baseline justify-between gap-4">
              <p className="text-xs font-medium text-[color:var(--muted)] uppercase tracking-[0.08em]">
                Amount
              </p>
              <p className="text-3xl font-semibold text-[color:var(--foreground)]">
                {formatINR(invoiceAmount)}
              </p>
            </div>

            {isUnlocked ? (
              <div className="rounded-xl border border-[color:var(--border)]/70 bg-[color:var(--surface)] p-4">
                <p className="text-sm font-semibold text-[color:var(--success-text)]">
                  Payment confirmed
                </p>
                <p className="text-xs text-[color:var(--muted)] mt-1">
                  Your files are unlocked.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <button
                    onClick={handlePay}
                    disabled={isPaying}
                    className="w-full btn-primary text-base py-3.5"
                  >
                    {isPaying
                      ? "Redirecting…"
                      : `Pay ${formatINR(invoiceAmount)} to unlock files`}
                  </button>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="fixed left-0 right-0 bottom-0 z-50 bg-[color:var(--background)]/80 backdrop-blur-md border-t border-[color:var(--border)] px-4 py-3 md:hidden"
                >
                  <button
                    onClick={handlePay}
                    disabled={isPaying}
                    className="w-full btn-primary text-base py-3.5"
                  >
                    {isPaying
                      ? "Redirecting…"
                      : `Pay ${formatINR(invoiceAmount)} to unlock files`}
                  </button>
                  <p className="text-center text-[11px] leading-relaxed text-[color:var(--muted)] mt-1">
                    Secure payment • Instant access
                  </p>
                </motion.div>

                <p className="hidden md:block text-[11px] leading-relaxed text-[color:var(--muted)]">
                  Secure payment • Instant access
                </p>
                {payError && (
                  <p className="text-xs font-medium text-red-600">
                    {payError}
                  </p>
                )}
              </>
            )}
          </div>
        </section>

        <footer className="pt-2 pb-6">
          <p className="text-center text-[11px] text-[color:var(--muted)]">
            Powered by Solva
          </p>
        </footer>
      </div>
    </div>
  )
}