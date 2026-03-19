"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Callback() {
  const router = useRouter()

  useEffect(() => {
    async function handleAuth() {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    }

    handleAuth()
  }, [])

  return <div>Logging you in...</div>
}