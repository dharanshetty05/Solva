"use client"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Lock, Download, CheckCircle, ShieldCheck, FileText, Zap } from "lucide-react"
import { useParams, useSearchParams } from "next/navigation"

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
}

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
  const paid = searchParams.get("paid")
  const projectIdFromUrl = searchParams.get("project_id")

useEffect(() => {
  if (!slug) return  // 🚨 THIS IS THE FIX

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

  fetchData()
}, [slug])

useEffect(() => {
  if (paid !== "true" || !projectIdFromUrl) return

  ;(async () => {
    try {
      await fetch("/api/mock/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: projectIdFromUrl }),
      })

      // IMPORTANT: only redirect using URL slug, NOT project object
      window.location.href = `/p/${slug}`
    } catch {
      setPayError("Payment confirmation failed.")
    }
  })()
}, [paid, projectIdFromUrl, slug])

  const handlePay = async () => {
    if (isPaying) return
    setPayError(null)
    setIsPaying(true)
    try {
                console.log("FRONTEND SLUG:", slug)

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
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <p className="text-sm text-neutral-400 font-medium tracking-wide">Project not found</p>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #F7F7F6;
          -webkit-font-smoothing: antialiased;
        }

        .portal-root {
          min-height: 100svh;
          background: #F7F7F6;
          padding: 0 16px 120px;
        }

        .portal-inner {
          max-width: 520px;
          margin: 0 auto;
          padding-top: 48px;
        }

        /* Cards */
        .card-surface {
          background: #FFFFFF;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03);
        }

        /* Header card */
        .header-card {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #111;
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-fallback {
          color: #fff;
          font-weight: 600;
          font-size: 17px;
          letter-spacing: -0.02em;
        }

        .header-meta {
          flex: 1;
          min-width: 0;
        }

        .header-name {
          font-size: 14px;
          font-weight: 600;
          color: #111;
          letter-spacing: -0.01em;
          margin: 0 0 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .header-project {
          font-size: 13px;
          color: #888;
          font-weight: 400;
          margin: 0 0 6px;
        }

        .header-detail {
          font-size: 12px;
          color: #aaa;
          margin: 0 0 1px;
        }

        /* Section label */
        .section-label {
          font-size: 11px;
          font-weight: 600;
          color: #aaa;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0 0 16px;
        }

        /* File items */
        .file-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid #F3F3F2;
        }

        .file-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .file-item:first-child {
          padding-top: 0;
        }

        .file-icon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: #F5F5F4;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #aaa;
        }

        .file-icon.unlocked {
          background: #F0F9F4;
          color: #22C55E;
        }

        .file-meta {
          flex: 1;
          min-width: 0;
        }

        .file-name {
          font-size: 13.5px;
          font-weight: 500;
          color: #1a1a1a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0 0 2px;
          letter-spacing: -0.01em;
        }

        .file-name.locked {
          filter: blur(4px);
          user-select: none;
          color: #999;
        }

        .file-size {
          font-size: 12px;
          color: #bbb;
          font-family: 'DM Mono', monospace;
          margin: 0;
        }

        .file-locked-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #c0b080;
          font-weight: 500;
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          border-radius: 6px;
          padding: 3px 8px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* Download button */
        .download-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #F5F5F4;
          border: 1px solid #E8E8E6;
          border-radius: 8px;
          padding: 7px 12px;
          font-size: 12.5px;
          font-weight: 500;
          color: #444;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          line-height: 1;
        }

        .download-btn:hover {
          background: #EEEEEC;
          border-color: #DDDDD8;
          color: #111;
        }

        .download-btn:active {
          background: #E6E6E3;
        }

        /* Payment section */
        .amount-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          padding: 20px 0 20px;
          border-bottom: 1px solid #F3F3F2;
          margin-bottom: 20px;
        }

        .amount-label {
          font-size: 13px;
          color: #888;
          font-weight: 400;
        }

        .amount-value {
          font-size: 28px;
          font-weight: 600;
          color: #111;
          letter-spacing: -0.03em;
          line-height: 1;
        }

        .pay-description {
          font-size: 13px;
          color: #999;
          line-height: 1.55;
          margin: 0 0 20px;
        }

        /* Primary CTA */
        .pay-btn {
          width: 100%;
          background: #111;
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 15px 20px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          letter-spacing: -0.01em;
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
          line-height: 1;
          position: relative;
          overflow: hidden;
        }

        .pay-btn:hover:not(:disabled) {
          background: #222;
          box-shadow: 0 2px 4px rgba(0,0,0,0.14), 0 6px 20px rgba(0,0,0,0.1);
          transform: translateY(-1px);
        }

        .pay-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 1px 2px rgba(0,0,0,0.12);
        }

        .pay-btn:disabled {
          background: #555;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Trust line */
        .trust-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 14px;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          color: #bbb;
          font-weight: 400;
        }

        /* Unlocked state */
        .unlocked-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          border-radius: 10px;
          padding: 13px 16px;
        }

        .unlocked-text {
          font-size: 13.5px;
          font-weight: 500;
          color: #16A34A;
          margin: 0;
        }

        /* Error */
        .error-text {
          font-size: 12px;
          color: #EF4444;
          margin-top: 10px;
          text-align: center;
        }

        /* Footer */
        .portal-footer {
          text-align: center;
          margin-top: 32px;
          font-size: 12px;
          color: #ccc;
          font-weight: 400;
          letter-spacing: 0.01em;
        }

        /* Mobile sticky bar */
        @media (max-width: 640px) {
          .portal-inner {
            padding-top: 32px;
          }
        }
      `}</style>

      <div className="portal-root">
        <div className="portal-inner">
          {/* Header */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="card-surface header-card"
            style={{ marginBottom: 16 }}
          >
            <div className="avatar">
              {freelancerLogoUrl ? (
                <img src={freelancerLogoUrl} alt={freelancerName} />
              ) : (
                <span className="avatar-fallback">
                  {freelancerName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="header-meta">
              <p className="header-name">{freelancerName}</p>
              <p className="header-project">{projectName}</p>
              <p className="header-detail">Prepared for {project.client_email || "Client"}</p>
              <p className="header-detail">Final delivery via secure link</p>
            </div>
          </motion.div>

          {/* Files */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="card-surface"
            style={{ padding: "24px", marginBottom: 16 }}
          >
            <p className="section-label">Files</p>
            <div>
              {files.map((file, i) => (
                <motion.div
                  key={file.id}
                  className="file-item"
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <div className={`file-icon ${isUnlocked ? "unlocked" : ""}`}>
                    {isUnlocked
                      ? <FileText size={16} strokeWidth={1.8} />
                      : <Lock size={15} strokeWidth={1.8} />
                    }
                  </div>
                  <div className="file-meta">
                    <p className={`file-name ${!isUnlocked ? "locked" : ""}`}>
                      {file.file_name}
                    </p>
                    <p className="file-size">{formatFileSizeKB(file.file_size)}</p>
                  </div>
                  {!isUnlocked ? (
                    <span className="file-locked-badge">
                      <Lock size={10} strokeWidth={2} />
                      Locked
                    </span>
                  ) : (
                    <button
                      className="download-btn"
                      onClick={async () => {
                        setIsDownloading(true)
                        try {
                          const res = await fetch("/api/files/download", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
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
                    >
                      <Download size={13} strokeWidth={2} />
                      Download
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
            {downloadError && (
              <p className="error-text">{downloadError}</p>
            )}
          </motion.div>

          {/* Payment */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="card-surface"
            style={{ padding: "24px", marginBottom: 0 }}
          >
            <p className="pay-description">
              Complete payment to receive final deliverables from {freelancerName}.
            </p>

            <div className="amount-row">
              <span className="amount-label">Amount</span>
              <span className="amount-value">{formatINR(invoiceAmount)}</span>
            </div>

            <AnimatePresence mode="wait">
              {!isUnlocked ? (
                <motion.div
                  key="pay"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <button
                    onClick={handlePay}
                    disabled={isPaying}
                    className="pay-btn"
                  >
                    {isPaying
                      ? "Redirecting…"
                      : `Complete payment of ${formatINR(invoiceAmount)} to access files`}
                  </button>
                  <div className="trust-row">
                    <span className="trust-item">
                      <ShieldCheck size={12} strokeWidth={2} />
                      Secure payment
                    </span>
                    <span className="trust-item">
                      <Zap size={12} strokeWidth={2} />
                      Files unlock instantly
                    </span>
                    <span className="trust-item">
                      No login required
                    </span>
                  </div>
                  {payError && (
                    <p className="error-text">{payError}</p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="unlocked"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="unlocked-banner"
                >
                  <CheckCircle size={18} strokeWidth={2} color="#16A34A" />
                  <p className="unlocked-text">Payment confirmed. Files unlocked.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.p
            className="portal-footer"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            Powered by Solva
          </motion.p>
        </div>
      </div>
    </>
  )
}