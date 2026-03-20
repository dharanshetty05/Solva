"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Login() {
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        router.push("/dashboard")
      }
    }

    checkUser()
  }, [])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            // redirectTo: "http://localhost:3000/auth/callback",
            redirectTo: `${location.origin}/auth/callback`
        },
    })
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm card px-6 py-7 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-[0.14em] text-[color:var(--muted)] uppercase">
            Solva
          </p>
          <h1 className="text-xl font-semibold text-[color:var(--foreground)]">
            Get paid. Files unlock.
          </h1>
          <p className="text-sm text-[color:var(--muted)]">
            Use your Google account to access your dashboard.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogin}
          className="w-full btn-primary"
        >
          <span className="h-5 w-5 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-semibold">
            G
          </span>
          <span>Continue with Google</span>
        </button>

        <p className="text-[11px] leading-relaxed text-[color:var(--muted)]">
          No extra steps. You’ll land directly in your projects.
        </p>
      </div>
    </div>
  )
}