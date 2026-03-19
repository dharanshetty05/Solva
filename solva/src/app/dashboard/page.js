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
        return <p className="p-6 text-gray-500">Loading...</p>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6">
                {/* Basic Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-semibold">Solva</h1>
                    <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-black">
                        Logout
                    </button>
                </div>

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