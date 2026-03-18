"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Dashboard() {
  const router = useRouter()

  useEffect(() => {
    async function getSession() {
      const { data, error } = await supabase.auth.getSession()

      if (!data.session) {
        router.push("/login")
      }
    }

    getSession()
  }, [])

  const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push("/login")
}


  return (
    <>
        <div>Dashboard</div>
        <button onClick={handleLogout}>Logout</button>
    </>
  ) 
}