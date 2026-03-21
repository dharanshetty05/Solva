"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"

const stagger = {
  show: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

/* ── Google wordmark SVG (inline, no external deps) ── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export default function Login() {
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getSession()
      if (data.session) router.push("/dashboard")
    }
    checkUser()
  }, [])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07061A] flex items-center justify-center px-4">

      {/* ── Background ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Central purple bloom */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[700px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(ellipse, rgba(83,74,183,0.22) 0%, transparent 70%)" }}
        />
        {/* Top edge glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#534AB7]/40 to-transparent" />
        {/* Bottom green trace */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[200px] w-[400px] rounded-full blur-3xl"
          style={{ background: "rgba(29,158,117,0.06)" }}
        />
        {/* Grain */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "128px",
          }}
        />
      </div>

      {/* ── Card ── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative w-full max-w-[360px]"
      >
        {/* Card glow border */}
        <div
          className="absolute -inset-px rounded-2xl"
          style={{ background: "linear-gradient(135deg, rgba(83,74,183,0.4) 0%, rgba(83,74,183,0.08) 60%, rgba(29,158,117,0.12) 100%)" }}
        />

        {/* Card body */}
        <div className="relative rounded-2xl bg-[#0E0C25] px-8 py-9 space-y-8">

          {/* Wordmark */}
          <motion.div variants={fadeUp}>
            <span className="text-[13px] font-bold tracking-[0.12em] text-[#534AB7] uppercase">
              Solva
            </span>
          </motion.div>

          {/* Headline + sub */}
          <motion.div variants={fadeUp} className="space-y-2.5">
            <h1 className="text-[1.6rem] font-bold leading-[1.1] tracking-[-0.03em] text-white">
              Get paid. Files unlock.
            </h1>
            <p className="text-sm leading-relaxed text-[#5E5C82]">
              Use your Google account to access your dashboard.
            </p>
          </motion.div>

          {/* Button */}
          <motion.div variants={fadeUp}>
            <motion.button
              type="button"
              onClick={handleLogin}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="group relative w-full overflow-hidden rounded-xl border border-white/[0.1] bg-white/[0.05] px-5 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:border-white/[0.18] hover:bg-white/[0.09]"
            >
              {/* Shimmer */}
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              <span className="relative flex items-center justify-center gap-3">
                <GoogleIcon />
                Continue with Google
              </span>
            </motion.button>
          </motion.div>

          {/* Footer note */}
          <motion.p variants={fadeUp} className="text-[11px] leading-relaxed text-[#2E2C4A]">
            No extra steps. You'll land directly in your projects.
          </motion.p>

        </div>
      </motion.div>

    </div>
  )
}