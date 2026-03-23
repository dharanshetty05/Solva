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
        if (!data.user) { router.push("/login"); return }
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
    if (!error && data) setProjects((prev) => [data[0], ...prev])
    return { data, error }
  }

  if (loading) {
    return (
      /*
        Skeleton uses the brand's Locked 50 (#F1EFE8) surface tone.
        Pulse opacity only — no color shift, keeps it calm.
      */
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center px-4">
        <div className="w-full max-w-[680px] space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-2.5 w-8 rounded-sm bg-[#E8E6E0] animate-pulse" />
              <div className="h-[22px] w-52 rounded-sm bg-[#E8E6E0] animate-pulse" />
            </div>
            <div className="h-6 w-14 rounded bg-[#E8E6E0] animate-pulse" />
          </div>
          <div className="rounded-xl bg-[#E8E6E0] animate-pulse h-[420px]" />
        </div>
      </div>
    )
  }

  return (
    /*
      Page background: warm off-white (#F8F7F4) — between Locked 50 (#F1EFE8)
      and white. Feels like a workspace, not a blank screen.
    */
    <div className="min-h-screen bg-[#F8F7F4]">

      {/* 1px top border — grounds the viewport without a nav bar */}
      <div className="h-px bg-[#E2E0DA]" />

      <div className="max-w-[680px] mx-auto px-6 py-10 space-y-8">

        {/* ── Header ──────────────────────────────────────────────── */}
        <header className="flex items-start justify-between">
          <div className="space-y-1">
            {/*
              Wordmark: Solva brand purple #7F77DD.
              Tiny, tracking-widest — present but not competing.
            */}
            <p
              className="text-[9px] font-semibold uppercase"
              style={{ letterSpacing: "0.22em", color: "#7F77DD" }}
            >
              Solva
            </p>
            {/*
              H1 scale from brand typography: weight 500 (not 600/700).
              Tracking tight, slightly larger for authority.
            */}
            <h1
              className="text-[21px] leading-tight"
              style={{ fontWeight: 500, color: "#2C2C2A", letterSpacing: "-0.02em" }}
            >
              Your projects, under control.
            </h1>
          </div>

          {/* Logout recedes completely — lowest visual weight on the page */}
          <button
            type="button"
            onClick={handleLogout}
            className="mt-0.5 text-[11px] transition-colors duration-150 focus-ring rounded px-2 py-1"
            style={{ color: "#888780", fontWeight: 500 }}
            onMouseEnter={e => e.currentTarget.style.color = "#2C2C2A"}
            onMouseLeave={e => e.currentTarget.style.color = "#888780"}
          >
            Logout
          </button>
        </header>

        <DashboardCard projects={projects} onNewProject={() => setShowModal(true)} />
      </div>

      {showModal && (
        <CreateProjectModal onClose={() => setShowModal(false)} onCreate={handleCreateProject} />
      )}
    </div>
  )
}