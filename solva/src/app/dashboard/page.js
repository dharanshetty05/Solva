"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState(null)

    const [projectName, setProjectName] = useState("")
    const [clientEmail, setClientEmail] = useState("")
    const [amount, setAmount] = useState("")

    useEffect(() => {
        async function getUser() {
            const { data, error } = await supabase.auth.getUser()
            if (!data.user) {
                router.push("/login")
            } else {
                setUser(data.user)
            }
        }
        getUser()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    const createProject = async () => {
        if (!projectName || !clientEmail || !amount) return

        const slug = Math.random().toString(36).substring(2, 10)

        const { data, error } = await supabase
            .from("projects")
            .insert([
            {
                user_id: user.id,
                project_name: projectName,
                client_email: clientEmail,
                invoice_amount: amount,
                portal_slug: slug,
            },
            ])
            .select()

        if (error) {
            console.error(error)
            return
        }

        setProjects((prev) => [data[0], ...prev])

        setProjectName("")
        setClientEmail("")
        setAmount("")
    }

    const [projects, setProjects] = useState([])

    const fetchProjects = async () => {
        const { data } = await supabase
            .from("projects")
            .select("*")
            .order("created_at", { ascending: false })

        setProjects(data || [])
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    return (
        <>
            <div className="p-10 space-y-4">
                <h1 className="text-xl font-bold">Create Project</h1>

                <input
                    placeholder="Project Name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="border p-2 w-full"
                />

                <input
                    placeholder="Client Email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="border p-2 w-full"
                />

                <input
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border p-2 w-full"
                />

                <button
                    onClick={createProject}
                    className="bg-black text-white px-4 py-2"
                >
                    Create Project
                </button>
            </div>

            <div className="mt-10">
                <h2 className="font-bold">Your Projects</h2>

                {projects.map((p) => (
                    <div key={p.id} className="border p-3 mt-2">
                    <p>{p.project_name}</p>
                    <p>{p.client_email}</p>
                    <p>₹{p.invoice_amount}</p>
                    <p>{p.status}</p>
                    </div>
                ))}
            </div>

            <button onClick={handleLogout}>Logout</button>
        </>
    )
}