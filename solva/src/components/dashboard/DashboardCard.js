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
    <div className="bg-white rounded-xl border p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">My projects</h2>

        <button
          onClick={onNewProject}
          className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
        >
          + New project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatBox label="active" value={active} />
        <StatBox label="paid out" value={`₹${paid.toLocaleString()}`} green />
        <StatBox label="awaiting" value={`₹${awaiting.toLocaleString()}`} yellow />
      </div>

      {/* List */}
      <div className="space-y-3">
        {projects.length === 0 ? (
          <p className="text-sm text-gray-500">No projects yet</p>
        ) : (
          projects.map((project) => (
            <ProjectRow key={project.id} project={project} />
        )))}
      </div>
    </div>
  )
}

function StatBox({ label, value, green, yellow }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`text-lg font-semibold ${
          green ? "text-green-600" : yellow ? "text-yellow-600" : ""
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
        <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
          Paid · Delivered
        </span>
      )
    }

    if (project.status === "awaiting_payment") {
      return (
        <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
          Awaiting payment
        </span>
      )
    }

    return (
      <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700">
        Portal sent
      </span>
    )
  }

  return (
    <div className="flex flex-col border-t pt-3 gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
          <p className="text-sm font-medium">{project.project_name}</p>
        </div>

        <div className="flex items-center gap-6">
          <p className="text-sm text-gray-600">
            ₹{Number(project.invoice_amount).toLocaleString()}
          </p>
          {getStatus()}
        </div>
      </div>

      <div className="mt-2 space-y-1">
        {files.length === 0 ? (
          <p className="text-xs text-gray-400">No files uploaded</p>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="relative text-xs bg-gray-50 px-2 py-2 rounded overflow-hidden"
            >
              {/* Blurred content */}
              <div className="blur-sm select-none pointer-events-none">
                {file.file_name} ({(file.file_size / 1024).toFixed(1)} KB)
              </div>

              {/* Lock overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                <span className="text-[10px] font-medium text-gray-700">
                  🔒 Locked until payment
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {project.status !== "paid" ? (
        <p className="text-xs text-gray-500 mt-2">
          Files are locked. Client must pay to unlock.
        </p>
      ) : (
        <p className="text-xs text-green-600 mt-2">
          Payment received. Files unlocked.
        </p>
      )}

      <div className="flex items-center gap-2 mt-2">
        <input
          value={`${location.origin}/p/${project.portal_slug}`}
          readOnly
          className="text-xs border px-2 py-1 rounded w-full"
        />

        <button
          onClick={() => {
            navigator.clipboard.writeText(
              `${location.origin}/p/${project.portal_slug}`
            )
          }}
          className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
        >
          Copy
        </button>
      </div>

      {/* Upload */}
      <div>
        <div className="border-2 border-dashed rounded-lg p-4 text-center text-xs text-gray-500">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id={`upload-${project.id}`}
          />

          <label
            htmlFor={`upload-${project.id}`}
            className="cursor-pointer"
          >
            Click to upload or drag files here
          </label>
        </div>
                {uploading && (
          <p className="text-xs text-blue-600 mt-1">
            Uploading files...
          </p>
        )}
      </div>
    </div>
  )
}