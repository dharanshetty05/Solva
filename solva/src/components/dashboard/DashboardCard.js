import { useState, useEffect } from "react"
import { uploadFile, saveFilesToDB } from "@/services/fileService"
import { supabase } from "@/lib/supabase"
import { getFilesByProject } from "@/services/fileService"

export default function DashboardCard({ projects, onNewProject }) {
  const active = projects.filter(p => p.status !== "paid").length

  const paid = projects
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.invoice_amount || 0), 0)

  const awaiting = projects
    .filter((p) => p.status === "awaiting_payment")
    .reduce((sum, p) => sum + Number(p.invoice_amount || 0), 0)

  return (
    <div className="card p-6 space-y-6">
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
            <ProjectRow key={project.id} project={project} />
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

function ProjectRow({ project }) {
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
      setFiles(data || [])
    }

    fetchFiles()
  }, [project.id])

  const handleFileUpload = async (e) => {
    const files = e.target.files
    if (!files.length) return

    setUploading(true)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    console.log("USER:", user)

    let uploadedFiles = []

    for (let file of files) {
      const result = await uploadFile({
        file,
        userId: user.id,
        projectId: project.id,
      })

      if (!result.error) {
        uploadedFiles.push({
          ...result,
          project_id: project.id,
          user_id: user.id,
        })
      }
    }

    console.log("UPLOADED FILES:", uploadedFiles)

    if (uploadedFiles.length > 0) {
      await saveFilesToDB(uploadedFiles)
    }

    setUploading(false)
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
          files.map((file) => (
            <div
              key={file.id}
              className="relative rounded-xl border border-[color:var(--border)]/70 bg-[color:var(--surface)] px-4 py-3 overflow-hidden transition-colors hover:bg-[color:var(--card)]"
            >
              {/* Blurred content */}
              <div
                className={`${
                  isLocked
                    ? "blur-sm select-none pointer-events-none text-[color:var(--locked-text)]"
                    : "text-[color:var(--foreground)]"
                } text-xs leading-relaxed`}
              >
                {file.file_name} ({(file.file_size / 1024).toFixed(1)} KB)
              </div>

              {/* Lock overlay */}
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                  <span className="rounded-full border border-[color:var(--border)]/70 bg-white/70 px-3 py-1 text-[11px] font-semibold text-[color:var(--locked-text)]">
                    🔒 Locked until payment
                  </span>
                </div>
              )}
            </div>
          ))
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