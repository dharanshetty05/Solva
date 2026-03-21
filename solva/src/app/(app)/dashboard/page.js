"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import DashboardCard from "@/components/dashboard/DashboardCard"
import CreateProjectModal from "@/components/dashboard/CreateProjectModal"
import { getProjects, createProject } from "@/services/projectService"

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [projects, setProjects] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function init() {
            setLoading(true)
            try {
                const { data } = await supabase.auth.getUser()
                if (!data.user) {
                    router.push("/login")
                    return
                }
                setUser(data.user)
                const { data: projectsData } = await getProjects()
                setProjects(projectsData || [])
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/")
    }

    const handleCreateProject = async (projectData) => {
        const { data, error } = await createProject(user.id, projectData)
        if (!error && data) {
            setProjects((prev) => [data[0], ...prev])
        }
        return { data, error }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[color:var(--background)] flex items-center justify-center px-4">
                <div className="w-full max-w-4xl space-y-6">
                    <div className="h-7 w-52 rounded-lg bg-white/60 animate-pulse" />
                    <div className="grid grid-cols-3 gap-3">
                        <div className="h-28 rounded-2xl bg-white/60 animate-pulse" />
                        <div className="h-28 rounded-2xl bg-white/60 animate-pulse" />
                        <div className="h-28 rounded-2xl bg-white/60 animate-pulse" />
                    </div>
                    <div className="h-24 rounded-2xl bg-white/60 animate-pulse" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[color:var(--background)]">
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[11px] font-medium tracking-[0.14em] text-[color:var(--muted)] uppercase">
                            Solva
                        </p>
                        <h1 className="text-xl font-semibold text-[color:var(--foreground)]">
                            Your projects, under control.
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="text-xs font-semibold text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors focus-ring rounded-xl px-3 py-2"
                    >
                        Logout
                    </button>
                </header>

                <DashboardCard projects={projects} onNewProject={() => setShowModal(true)} />

                {/* Create Project Modal */}
                {showModal && (
                    <CreateProjectModal
                        onClose={() => setShowModal(false)}
                        onCreate={handleCreateProject}
                    />
                )}
            </div>
        </div>
    )
}