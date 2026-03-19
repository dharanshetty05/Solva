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
    <div className="min-h-screen bg-[#F1EFE8] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-[#E4E1D6] rounded-2xl shadow-sm px-6 py-7 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-[0.14em] text-[#888780] uppercase">
            Solva
          </p>
          <h1 className="text-xl font-semibold text-[#26215C]">
            Get paid. Files unlock.
          </h1>
          <p className="text-sm text-[#888780]">
            Use your Google account to access your dashboard.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogin}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#3C3489] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#26215C] transition-colors"
        >
          <span className="h-5 w-5 rounded bg-white/10 flex items-center justify-center text-[10px]">
            G
          </span>
          <span>Continue with Google</span>
        </button>

        <p className="text-[11px] leading-relaxed text-[#888780]">
          No extra steps. You’ll land directly in your projects.
        </p>
      </div>
    </div>
  )
}