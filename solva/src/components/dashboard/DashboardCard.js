import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { uploadFile, saveFilesToDB } from "@/services/fileService"
import { supabase } from "@/lib/supabase"
import { getFilesByProject } from "@/services/fileService"

export default function DashboardCard({ projects, onNewProject }) {
  const [toast, setToast] = useState(null)
  const toastTimerRef = useRef(null)

  const showToast = (type, message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ type, message })
    toastTimerRef.current = setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  const active = projects.filter(p => p.status !== "paid").length

  const paid = projects
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.invoice_amount || 0), 0)

  const awaiting = projects
    .filter((p) => p.status === "awaiting_payment")
    .reduce((sum, p) => sum + Number(p.invoice_amount || 0), 0)

  return (
    <div className="card p-6 space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50 px-4"
          >
            <div
              className={`rounded-xl border px-4 py-3 text-xs font-semibold shadow-sm ${
                toast.type === "success"
                  ? "border-[color:var(--success-text)] bg-white text-[color:var(--success-text)]"
                  : "border-red-200 bg-white text-red-600"
              }`}
            >
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-[color:var(--foreground)]">
            My projects
          </h2>
          <p className="text-xs text-[color:var(--muted)]">
            Lock files. Share a link. Get paid.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewProject}
          className="inline-flex items-center gap-1 rounded-xl bg-[color:var(--primary)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[color:var(--primary-hover)] transition-colors focus-ring"
        >
          <span className="text-sm leading-none">+</span>
          <span>New project</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Active" value={active} />
        <StatBox label="Paid out" value={`₹${paid.toLocaleString()}`} green />
        <StatBox
          label="Awaiting"
          value={`₹${awaiting.toLocaleString()}`}
          yellow
        />
      </div>

      {/* List */}
      <div className="space-y-3 pt-2 border-t border-[color:var(--border)]">
        {projects.length === 0 ? (
          <p className="text-sm text-[color:var(--muted)]">
            No projects yet. Create one to lock files behind payment.
          </p>
        ) : (
          projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              onToast={showToast}
            />
          ))
        )}
      </div>
    </div>
  )
}

function StatBox({ label, value, green, yellow }) {
  return (
    <div className="rounded-xl p-4 border border-[color:var(--border)] bg-[color:var(--surface)]">
      <p className="text-xs font-medium text-[color:var(--muted)]">{label}</p>
      <p
        className={`text-lg font-semibold ${
          green
            ? "text-[color:var(--success-text)]"
            : yellow
            ? "text-[color:var(--accent-value)]"
            : "text-[color:var(--foreground)]"
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function ProjectRow({ project, onToast }) {
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState([])
  const isLocked = project.status !== "paid"
  const dotClass =
    project.status === "paid"
      ? "bg-[color:var(--success-text)]"
      : project.status === "awaiting_payment"
      ? "bg-[color:var(--accent-value)]"
      : "bg-[color:var(--muted)]"

  useEffect(() => {
    async function fetchFiles() {
      const { data } = await getFilesByProject(project.id)
      setFiles(
        (data || []).map((f) => ({
          tempId: `db-${f.id}`,
          id: f.id,
          status: "uploaded",
          file_name: f.file_name,
          file_size: f.file_size,
          file_path: f.file_path,
        }))
      )
    }

    fetchFiles()
  }, [project.id])

  const fileKey = (name, size) => `${name}::${size ?? 0}`
  const formatFileSizeKB = (bytes) =>
    `${(Number(bytes || 0) / 1024).toFixed(1)} KB`

  const patchFile = (tempId, patch) => {
    setFiles((prev) => prev.map((f) => (f.tempId === tempId ? { ...f, ...patch } : f)))
  }

  const handleRetryUpload = async (tempId) => {
    const entry = files.find((f) => f.tempId === tempId)
    if (!entry?.file) return
    if (uploading) return

    setUploading(true)
    patchFile(tempId, { status: "uploading", errorMessage: null })

    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) throw new Error("Not authenticated")

      const result = await uploadFile({
        file: entry.file,
        userId: user.id,
        projectId: project.id,
      })

      if (result.error) {
        patchFile(tempId, {
          status: "error",
          errorMessage:
            result.error?.message || "Upload failed. Try again.",
        })
        onToast?.("error", "Upload failed. Try again.")
        return
      }

      const payload = {
        ...result,
        project_id: project.id,
        user_id: user.id,
      }

      const { data: inserted, error: insertError } = await saveFilesToDB([
        payload,
      ])

      if (insertError) {
        patchFile(tempId, {
          status: "error",
          errorMessage: "Upload failed. Try again.",
        })
        onToast?.("error", "Upload failed. Try again.")
        return
      }

      const row = inserted?.[0]
      if (!row) throw new Error("Upload succeeded but DB row missing")

      patchFile(tempId, {
        status: "uploaded",
        id: row.id,
        file_name: row.file_name,
        file_size: row.file_size,
        file_path: row.file_path,
        errorMessage: null,
        file: undefined, // keep memory small
      })

      onToast?.("success", "File uploaded successfully")
    } catch (e) {
      patchFile(tempId, {
        status: "error",
        errorMessage: "Upload failed. Try again.",
      })
      onToast?.("error", "Upload failed. Try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (!selectedFiles.length) return

    // Allow the user to re-select the same file(s) after an error.
    e.target.value = ""

    if (uploading) return

    const existingKeys = new Set(
      files.map((f) => fileKey(f.file_name, f.file_size))
    )

    const nextSelections = selectedFiles.filter(
      (f) => !existingKeys.has(fileKey(f.name, f.size))
    )

    if (nextSelections.length === 0) return

    const now = Date.now()
    const tempEntries = nextSelections.map((file, idx) => ({
      tempId: `temp-${now}-${idx}-${Math.random().toString(16).slice(2)}`,
      status: "uploading",
      file,
      file_name: file.name,
      file_size: file.size,
      file_path: null,
      errorMessage: null,
    }))

    // Optimistic UI: show upload cards immediately (no refresh needed).
    setFiles((prev) => [...tempEntries, ...prev])
    setUploading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) throw new Error("Not authenticated")

      const payloadsToInsert = []
      const successfulTempIds = []
      let hadAnyError = false

      for (const temp of tempEntries) {
        const result = await uploadFile({
          file: temp.file,
          userId: user.id,
          projectId: project.id,
        })

        if (result.error) {
          hadAnyError = true
          patchFile(temp.tempId, {
            status: "error",
            errorMessage: result.error?.message || "Upload failed.",
          })
          continue
        }

        successfulTempIds.push(temp.tempId)
        patchFile(temp.tempId, { file_path: result.file_path })

        payloadsToInsert.push({
          ...result,
          project_id: project.id,
          user_id: user.id,
        })
      }

      if (payloadsToInsert.length > 0) {
        const { data: inserted, error: insertError } = await saveFilesToDB(
          payloadsToInsert
        )

        if (insertError) {
          hadAnyError = true
          successfulTempIds.forEach((tempId) =>
            patchFile(tempId, {
              status: "error",
              errorMessage: "Upload failed. Try again.",
            })
          )
        } else {
          const insertedByPath = new Map(
            (inserted || []).map((row) => [row.file_path, row])
          )

          setFiles((prev) =>
            prev.map((f) => {
              if (f.status !== "uploading" || !f.file_path) return f
              const row = insertedByPath.get(f.file_path)
              if (!row) return f
              return {
                ...f,
                status: "uploaded",
                id: row.id,
                file_name: row.file_name,
                file_size: row.file_size,
                file_path: row.file_path,
                errorMessage: null,
                file: undefined,
              }
            })
          )
        }
      }

      if (hadAnyError) {
        onToast?.("error", "Upload failed. Try again.")
      } else {
        onToast?.("success", "File uploaded successfully")
      }
    } catch (e) {
      // Mark every new temp entry as errored if we fail before uploading begins.
      tempEntries.forEach((temp) =>
        patchFile(temp.tempId, {
          status: "error",
          errorMessage: "Upload failed. Try again.",
        })
      )
      onToast?.("error", "Upload failed. Try again.")
    } finally {
      setUploading(false)
    }
  }

  const getStatus = () => {
    if (project.status === "paid") {
      return (
        <span className="badge-paid">
          Paid · Delivered
        </span>
      )
    }

    if (project.status === "awaiting_payment") {
      return (
        <span className="badge-awaiting">
          Awaiting payment
        </span>
      )
    }

    return (
      <span className="badge-locked">
        Portal sent
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`h-2 w-2 rounded-full ${dotClass}`} />
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-[color:var(--foreground)]">
              {project.project_name}
            </p>
            <p className="text-[11px] text-[color:var(--muted)]">
              Invoice · ₹{Number(project.invoice_amount).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {getStatus()}
        </div>
      </div>

      <div className="space-y-1">
        {files.length === 0 ? (
          <p className="text-xs text-[color:var(--muted)]">No files uploaded.</p>
        ) : (
          <AnimatePresence initial={false}>
            {files.map((file) => {
              const blurForLockedUploaded =
                isLocked && file.status === "uploaded"
              const showLockOverlay =
                isLocked && file.status === "uploaded"

              return (
                <motion.div
                  key={file.tempId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative rounded-xl border border-[color:var(--border)]/70 bg-[color:var(--surface)] px-4 py-3 overflow-hidden transition-colors hover:bg-[color:var(--card)]"
                >
                  <div className="space-y-1">
                    <p
                      className={`text-sm font-semibold leading-relaxed ${
                        blurForLockedUploaded
                          ? "blur-sm select-none pointer-events-none text-[color:var(--locked-text)]"
                          : "text-[color:var(--foreground)]"
                      }`}
                    >
                      {file.file_name}
                    </p>
                    <p
                      className={`text-xs leading-relaxed ${
                        blurForLockedUploaded
                          ? "blur-sm select-none pointer-events-none text-[color:var(--locked-text)]"
                          : "text-[color:var(--muted)]"
                      }`}
                    >
                      {formatFileSizeKB(file.file_size)}
                    </p>

                    {file.status === "uploading" && (
                      <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-[color:var(--accent-value)] border border-[color:var(--border)]/70">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[color:var(--border)] border-t-[color:var(--accent-value)]" />
                        Uploading...
                      </div>
                    )}

                    {file.status === "error" && (
                      <div className="mt-1 flex items-center justify-between gap-3">
                        <p className="text-[11px] font-semibold text-red-600">
                          Upload failed
                        </p>
                        <button
                          type="button"
                          disabled={uploading}
                          onClick={() => handleRetryUpload(file.tempId)}
                          className="rounded-xl border border-red-200 bg-white px-3 py-1 text-[11px] font-semibold text-red-600 transition-colors hover:bg-[color:var(--surface)] disabled:opacity-70 disabled:cursor-not-allowed focus-ring"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {file.status === "uploaded" && (
                      <div className="mt-1 text-[11px] font-semibold text-[color:var(--success-text)]">
                        Uploaded
                      </div>
                    )}
                  </div>

                  {/* Lock overlay (only for already-uploaded files) */}
                  <AnimatePresence>
                    {showLockOverlay && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                        <span className="rounded-full border border-[color:var(--border)]/70 bg-white/70 px-3 py-1 text-[11px] font-semibold text-[color:var(--locked-text)]">
                          🔒 Locked until payment
                        </span>
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {project.status !== "paid" ? (
        <p className="text-xs text-[color:var(--muted)]">
          Files are locked. Client must pay to unlock.
        </p>
      ) : (
        <p className="text-xs text-[color:var(--success-text)]">
          Payment received. Files unlocked.
        </p>
      )}

      <div className="flex items-center gap-2">
        <input
          value={`${location.origin}/p/${project.portal_slug}`}
          readOnly
          className="w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-xs text-[color:var(--foreground)] focus-ring"
        />

        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(
              `${location.origin}/p/${project.portal_slug}`
            )
          }}
          className="rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--primary)] transition-colors hover:bg-[color:var(--accent-bg)] hover:border-[color:var(--accent-value)] focus-ring"
        >
          Copy
        </button>
      </div>

      {/* Upload */}
      <div>
        <div className="border border-dashed border-[color:var(--border)] rounded-xl p-4 text-center text-xs text-[color:var(--muted)] bg-white transition-colors hover:bg-[color:var(--surface)]">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id={`upload-${project.id}`}
            disabled={uploading}
          />

          <label
            htmlFor={`upload-${project.id}`}
            className={`cursor-pointer font-semibold text-[color:var(--primary)] ${
              uploading
                ? "opacity-60 cursor-not-allowed"
                : "hover:underline focus-ring"
            }`}
          >
            Click to upload or drag files here
          </label>
        </div>
        {uploading && (
          <p className="text-xs text-[color:var(--accent-value)] mt-1 animate-pulse">
            Uploading files…
          </p>
        )}
      </div>
    </div>
  )
}