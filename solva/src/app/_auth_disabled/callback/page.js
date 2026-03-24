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

  return (
    <div className="min-h-screen bg-[color:var(--background)] flex items-center justify-center px-4">
      <div className="card w-full max-w-sm flex flex-col items-center text-center py-10">
        <div className="h-10 w-10 rounded-2xl bg-[color:var(--primary)] text-white flex items-center justify-center">
          <span className="text-sm font-bold">S</span>
        </div>
        <div className="mt-4 space-y-1">
          <h1 className="text-base font-semibold text-[color:var(--foreground)]">
            Logging you in
          </h1>
          <p className="text-sm text-[color:var(--muted)]">One moment…</p>
        </div>
      </div>
    </div>
  )
}