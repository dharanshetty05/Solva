"use client"

import { useEffect, useState } from "react"
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

    // useEffect for Data fetching
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
    <div className="min-h-screen bg-[color:var(--background)] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-medium tracking-[0.14em] text-[color:var(--muted)] uppercase">
                Solva portal
              </p>
              <h1 className="text-lg font-semibold text-[color:var(--foreground)]">
                {project.paid_at ? "Your files are ready." : "Unlock your files."}
              </h1>
              <p className="text-sm text-[color:var(--muted)]">
                {project.paid_at
                  ? "Payment confirmed. You can download your files."
                  : "Complete payment to unlock and download."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {project.paid_at ? (
                <span className="badge-paid">Paid</span>
              ) : (
                <span className="badge-awaiting">Awaiting payment</span>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-[color:var(--foreground)]">
              Invoice · ₹{Number(project.invoice_amount).toLocaleString()}
            </p>
            <p className="text-sm text-[color:var(--muted)]">
              {project.paid_at
                ? "Downloads are available below."
                : "Files stay locked until payment is confirmed."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Payment (dominant CTA) */}
          <aside className="md:col-span-2 space-y-4">
            <div className="card p-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold text-[color:var(--foreground)]">
                      Payment
                    </h2>
                    <p className="text-xs text-[color:var(--muted)] mt-1">
                      Secure checkout
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-medium text-[color:var(--muted)] uppercase tracking-[0.08em]">
                      Amount
                    </p>
                    <p className="text-2xl font-semibold text-[color:var(--foreground)]">
                      ₹{Number(project.invoice_amount).toLocaleString()}
                    </p>
                  </div>
                </div>

                {project.paid_at ? (
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
                    <button
                      onClick={handlePay}
                      disabled={isPaying}
                      className="w-full btn-primary"
                    >
                      {isPaying ? "Redirecting…" : "Pay & unlock files"}
                    </button>
                    <p className="text-[11px] leading-relaxed text-[color:var(--muted)]">
                      Your creator will deliver downloads right after payment confirmation.
                    </p>
                    {payError && (
                      <p className="text-xs font-medium text-red-600">
                        {payError}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </aside>

          {/* Files */}
          <section className="md:col-span-3">
            <div className="card p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-[color:var(--foreground)]">
                  Files
                </h2>
                {project.status !== "paid" && (
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
                      {/* Blurred content (locked state) */}
                      <div
                        className={`${
                          !project.paid_at
                            ? "blur-sm select-none pointer-events-none text-[color:var(--locked-text)]"
                            : "text-[color:var(--foreground)]"
                        } text-xs leading-relaxed`}
                      >
                        {file.file_name} ({(file.file_size / 1024).toFixed(1)} KB)
                      </div>

                      {!project.paid_at && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                          <span className="rounded-full border border-[color:var(--border)]/70 bg-white/70 px-3 py-1 text-[11px] font-semibold text-[color:var(--locked-text)]">
                            🔒 Locked until payment
                          </span>
                        </div>
                      )}

                      {project.paid_at && (
                        <button
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
                          className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-[color:var(--border)] bg-white px-4 py-2 text-xs font-semibold text-[color:var(--primary)] transition-colors hover:bg-[color:var(--surface)] disabled:opacity-70 disabled:cursor-not-allowed focus-ring"
                        >
                          {isDownloading ? "Preparing…" : "Download"}
                        </button>
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
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}