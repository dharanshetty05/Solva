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
            const { data } = await supabase.auth.getUser()
            if (!data.user) {
                router.push("/login")
                return
            }
            setUser(data.user)
            const { data: projectsData } = await getProjects()
            setProjects(projectsData || [])
        }
        init()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
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
            <div className="min-h-screen flex items-center justify-center bg-[#F1EFE8]">
                <p className="text-sm text-[#888780]">Loading dashboard…</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F1EFE8]">
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[11px] font-medium tracking-[0.14em] text-[#888780] uppercase">
                            Solva
                        </p>
                        <h1 className="text-xl font-semibold text-[#26215C]">
                            Your projects, under control.
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="text-xs font-medium text-[#888780] hover:text-[#2C2C2A] transition-colors"
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