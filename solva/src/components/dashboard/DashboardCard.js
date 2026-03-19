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
    <div className="bg-white rounded-2xl border border-[#E4E1D6] p-6 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-[#2C2C2A]">
            My projects
          </h2>
          <p className="text-xs text-[#888780]">
            Lock files. Share a link. Get paid.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewProject}
          className="inline-flex items-center gap-1 rounded-lg bg-[#3C3489] px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-[#26215C] transition-colors"
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
      <div className="space-y-3 pt-2 border-t border-[#E4E1D6]">
        {projects.length === 0 ? (
          <p className="text-sm text-[#888780]">
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
    <div className="rounded-xl p-4 border border-[#E4E1D6] bg-[#F9F8F3]">
      <p className="text-xs font-medium text-[#888780]">{label}</p>
      <p
        className={`text-lg font-semibold ${
          green
            ? "text-[#085641]"
            : yellow
            ? "text-[#7F77DD]"
            : "text-[#2C2C2A]"
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
        <span className="text-[11px] px-3 py-1 rounded-full bg-[#E1F5EE] text-[#085641]">
          Paid · Delivered
        </span>
      )
    }

    if (project.status === "awaiting_payment") {
      return (
        <span className="text-[11px] px-3 py-1 rounded-full bg-[#EEDDFE] text-[#3C3489]">
          Awaiting payment
        </span>
      )
    }

    return (
      <span className="text-[11px] px-3 py-1 rounded-full bg-[#F1EFE8] text-[#2C2C2A]">
        Portal sent
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-[#F9F8F3] border border-[#E4E1D6] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-[#888780]" />
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-[#2C2C2A]">
              {project.project_name}
            </p>
            <p className="text-[11px] text-[#888780]">
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
          <p className="text-xs text-[#888780]">No files uploaded.</p>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="relative text-xs bg-[#F1EFE8] px-3 py-2 rounded-lg overflow-hidden"
            >
              {/* Blurred content */}
              <div className="blur-sm select-none pointer-events-none text-[#2C2C2A]">
                {file.file_name} ({(file.file_size / 1024).toFixed(1)} KB)
              </div>

              {/* Lock overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                <span className="text-[10px] font-medium text-[#2C2C2A]">
                  🔒 Locked until payment
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {project.status !== "paid" ? (
        <p className="text-xs text-[#888780]">
          Files are locked. Client must pay to unlock.
        </p>
      ) : (
        <p className="text-xs text-[#085641]">
          Payment received. Files unlocked.
        </p>
      )}

      <div className="flex items-center gap-2">
        <input
          value={`${location.origin}/p/${project.portal_slug}`}
          readOnly
          className="text-xs border border-[#E4E1D6] bg-white px-2.5 py-1.5 rounded-lg w-full text-[#2C2C2A]"
        />

        <button
          onClick={() => {
            navigator.clipboard.writeText(
              `${location.origin}/p/${project.portal_slug}`
            )
          }}
          className="text-xs px-2.5 py-1.5 border border-[#E4E1D6] rounded-lg text-[#26215C] hover:bg-[#EEDDFE] hover:border-[#7F77DD] transition-colors font-medium"
        >
          Copy
        </button>
      </div>

      {/* Upload */}
      <div>
        <div className="border border-dashed border-[#E4E1D6] rounded-lg p-4 text-center text-xs text-[#888780] bg-white">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id={`upload-${project.id}`}
          />

          <label
            htmlFor={`upload-${project.id}`}
            className="cursor-pointer text-[#3C3489] font-medium"
          >
            Click to upload or drag files here
          </label>
        </div>
        {uploading && (
          <p className="text-xs text-[#7F77DD] mt-1">
            Uploading files…
          </p>
        )}
      </div>
    </div>
  )
}