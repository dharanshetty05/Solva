"use client"

import Link from "next/link"
import { ShieldCheck, Lock, Unlock, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

const stagger = {
  show: { transition: { staggerChildren: 0.09 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

const files = [
  {
    name: "Brand_identity_v3.ai",
    state: "locked",
    label: "Awaiting payment",
    ext: "AI",
    color: "#534AB7",
    labelColor: "#6E6C99",
  },
  {
    name: "Logo_finals.zip",
    state: "unlocked",
    label: "Unlocked — paid",
    ext: "ZIP",
    color: "#1D9E75",
    labelColor: "#1D9E75",
  },
  {
    name: "Style_guide.pdf",
    state: "locked",
    label: "Awaiting payment",
    ext: "PDF",
    color: "#534AB7",
    labelColor: "#6E6C99",
  },
]

export default function Hero() {

  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)


  return (
    <section className="relative min-h-screen overflow-hidden bg-[#07061A] flex flex-col justify-center">

      {/* Background layers */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(83,74,183,0.45) 0%, transparent 65%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 40% at 100% 100%, rgba(29,158,117,0.12) 0%, transparent 60%)" }} />
      </div>

      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#534AB7]/60 to-transparent" />

      <div className="relative mx-auto w-full max-w-5xl px-5 py-28 md:py-36">
        <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col items-center text-center">

          {/* Badge */}
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#534AB7]/40 bg-[#534AB7]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#A09FD4] backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-[#7F77DD]" strokeWidth={2.5} />
              Built for digital creators & teams
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="mt-8 max-w-3xl text-[2.8rem] font-bold leading-[1.06] tracking-[-0.04em] text-white md:text-[4.5rem]"
          >
            Get paid before you{" "}
            <span className="bg-gradient-to-r from-[#A09FD4] to-[#7F77DD] bg-clip-text text-transparent">
              deliver your files.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-lg text-base leading-7 text-[#6E6C99] md:text-lg"
          >
            Solva locks your files behind a secure payment link.
Once payment is completed, access unlocks instantly — no manual follow-ups required
</motion.p>
          {/* CTA */}
          <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>

<form
  onSubmit={(e) => {
    e.preventDefault()
    setSubmitted(true)
    setEmail("")
  }}
  className="flex flex-col sm:flex-row items-center justify-center gap-3"
>
  {submitted ? (
    <p className="text-green-400 text-sm">
      You're on the waitlist 🚀
    </p>
  ) : (
    <>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="w-72 rounded-xl bg-[#0E0C25] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-[#4E4C70] outline-none focus:border-[#534AB7]"
      />

      <button
        type="submit"
        className="group inline-flex items-center gap-2.5 rounded-xl bg-[#534AB7] px-8 py-3 text-sm font-semibold text-white"
      >
        Join waitlist
      </button>
    </>
  )}
</form>

            </motion.div>
            <p className="text-xs text-[#4E4C70]">
              Early access. No setup required. Takes less than 2 minutes.
            </p>
          </motion.div>

          {/* Product mockup */}
          <motion.div variants={fadeUp} className="mt-20 w-full max-w-2xl">
            <div className="relative rounded-2xl p-px" style={{ background: "linear-gradient(135deg, rgba(83,74,183,0.6) 0%, rgba(83,74,183,0.1) 50%, rgba(29,158,117,0.3) 100%)" }}>
              <div className="rounded-2xl bg-[#0E0C25] overflow-hidden">

                {/* Browser bar */}
                <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#0B0921] px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF6059]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#27C840]" />
                  <div className="ml-3 flex-1 rounded-md bg-white/[0.05] px-3 py-1">
                    <span className="text-[11px] text-[#4E4C70]">solva.io/d/brand-kit-v3</span>
                  </div>
                </div>

                {/* File cards */}
                <div className="grid grid-cols-3 gap-3 p-5">
                  {files.map((file, i) => (
                    <motion.div
                      key={file.name}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="rounded-xl border p-4 flex flex-col gap-3"
                      style={{
                        background: file.state === "unlocked" ? "rgba(29,158,117,0.07)" : "rgba(83,74,183,0.07)",
                        borderColor: file.state === "unlocked" ? "rgba(29,158,117,0.25)" : "rgba(83,74,183,0.25)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-lg px-2 py-0.5 text-[10px] font-bold tracking-wider" style={{ background: `${file.color}22`, color: file.color }}>
                          {file.ext}
                        </span>
                        {file.state === "unlocked"
                          ? <Unlock className="h-3.5 w-3.5 text-[#1D9E75]" strokeWidth={2} />
                          : <Lock className="h-3.5 w-3.5 opacity-40" style={{ color: file.color }} strokeWidth={2} />
                        }
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-1.5 w-full rounded-full" style={{ background: `${file.color}30` }} />
                        <div className="h-1.5 w-3/4 rounded-full" style={{ background: `${file.color}18` }} />
                      </div>
                      <span className="text-[10px] font-semibold" style={{ color: file.labelColor }}>
                        {file.label}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-3 border-t border-white/[0.06]">
                  {[
                    { value: "0s", label: "Unlock delay" },
                    { value: "100%", label: "Payment before delivery" },
                    { value: "1 link", label: "Shared with client" },
                  ].map((s, i) => (
                    <div key={s.label} className={`flex flex-col items-center py-4 px-3 ${i < 2 ? "border-r border-white/[0.06]" : ""}`}>
                      <span className="text-lg font-bold text-white">{s.value}</span>
                      <span className="mt-0.5 text-center text-[10px] leading-tight text-[#4E4C70]">{s.label}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Glow reflection */}
            <div className="mx-auto mt-2 h-8 w-3/4 rounded-full bg-[#534AB7]/20 blur-2xl" />
          </motion.div>

        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#07061A] to-transparent" />
    </section>
  )
}