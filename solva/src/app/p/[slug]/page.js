"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"

export default function PortalPage() {
    const { slug } = useParams()

    const [project, setProject] = useState(null)
    const [files, setFiles] = useState([])
    const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1EFE8]">
        <p className="text-sm text-[#888780]">Loading files…</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1EFE8]">
        <p className="text-sm text-red-600">Project not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F1EFE8] flex justify-center px-4 py-8">
      <div className="w-full max-w-xl space-y-5">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-[#E4E1D6] space-y-3 shadow-sm">
          <div className="space-y-1">
            <p className="text-[11px] font-medium tracking-[0.14em] text-[#888780] uppercase">
              Solva portal
            </p>
            <h1 className="text-lg font-semibold text-[#26215C]">
              Your files are ready.
            </h1>
            <p className="text-sm text-[#888780]">
              {project.status === "paid"
                ? "Payment confirmed. You can download your files."
                : "Complete payment to unlock and download."}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <p className="text-sm text-[#2C2C2A]">
              Invoice · ₹{Number(project.invoice_amount).toLocaleString()}
            </p>
            <div>
              {project.status === "paid" ? (
                <span className="text-[11px] px-3 py-1 rounded-full bg-[#E1F5EE] text-[#085641]">
                  Paid
                </span>
              ) : (
                <span className="text-[11px] px-3 py-1 rounded-full bg-[#F1EFE8] text-[#2C2C2A]">
                  Awaiting payment
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Files */}
        <div className="bg-white p-6 rounded-2xl border border-[#E4E1D6] space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[#2C2C2A]">Files</h2>
            {project.status !== "paid" && (
              <span className="text-[11px] text-[#888780]">
                Locked until payment
              </span>
            )}
          </div>

          {files.length === 0 ? (
            <p className="text-xs text-[#888780]">
              No files uploaded yet. Your creator will add files here.
            </p>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className="relative text-xs bg-[#F9F8F3] px-3 py-2 rounded-lg overflow-hidden"
              >
                {/* Blurred content */}
                <div
                  className={`${
                    project.status !== "paid" ? "blur-sm" : ""
                  } select-none pointer-events-none text-[#2C2C2A]`}
                >
                  {file.file_name} ({(file.file_size / 1024).toFixed(1)} KB)
                </div>

                {/* Lock overlay */}
                {!project.paid_at && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                    <span className="text-[10px] font-medium text-[#2C2C2A]">
                      🔒 Locked until payment
                    </span>
                  </div>
                )}

                {project.status === "paid" && (
                  <button
                    onClick={async () => {
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
                    }}
                    className="mt-2 inline-flex text-[11px] font-medium text-[#3C3489] hover:text-[#26215C] underline decoration-[#7F77DD]/60"
                  >
                    Download
                  </button>
                )}
              </div>
            ))
          )}

          {!project.paid_at && (
            <button className="mt-3 w-full bg-[#3C3489] text-white py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-[#26215C] transition-colors">
              Pay &amp; unlock files
            </button>
          )}
        </div>
      </div>
    </div>
  )
}