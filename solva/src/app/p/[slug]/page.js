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
        return <p className="p-6 text-gray-500">Loading...</p>
    }

    if (!project) {
        return <p className="p-6 text-red-500">Project not found</p>
    }

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center">
        <div className="w-full max-w-xl p-6 space-y-6">

            {/* Header */}
            <div className="bg-white p-6 rounded-xl border space-y-2">

            <h1 className="text-lg font-semibold">
  Your files are ready
</h1>

<p className="text-sm text-gray-500">
  Complete payment to unlock and download
</p>

            <p className="text-sm text-gray-500">
                Invoice: ₹{Number(project.invoice_amount).toLocaleString()}
            </p>

            <div>
                {project.status === "paid" ? (
                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                    Paid
                </span>
                ) : (
                <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                    Awaiting payment
                </span>
                )}
            </div>
            </div>

            {/* Files */}
            <div className="bg-white p-6 rounded-xl border space-y-3">
            <h2 className="text-sm font-medium">Files</h2>

            {files.length === 0 ? (
                <p className="text-xs text-gray-400">
                    No files uploaded yet. Upload files to lock them.
                </p>
            ) : (
                files.map((file) => (
                <div
                    key={file.id}
                    className="relative text-xs bg-gray-50 px-2 py-2 rounded overflow-hidden"
                >
                    {/* Blurred content */}
                    <div
                    className={`${
                        project.status !== "paid" ? "blur-sm" : ""
                    } select-none pointer-events-none`}
                    >
                    {file.file_name} (
                    {(file.file_size / 1024).toFixed(1)} KB)
                    </div>

                    {/* Lock overlay */}
                    {!project.paid_at && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                        <span className="text-[10px] font-medium text-gray-700">
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
                        className="mt-2 text-xs text-blue-600 underline"
                    >
                        Download
                    </button>
                    )}
                </div>
                ))
            )}
                {!project.paid_at && (
    <button className="w-full bg-black text-white py-2 rounded-lg text-sm mt-2">
        Pay & Unlock Files
    </button>
    )}
            </div>


        </div>
        </div>
    )
}