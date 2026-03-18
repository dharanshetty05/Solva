"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Callback() {
  const router = useRouter()

  useEffect(() => {
    async function handleAuth() {
      await supabase.auth.getSession()
      router.push("/dashboard")
    }

    handleAuth()
  }, [])

  return <div>Logging you in...</div>
}