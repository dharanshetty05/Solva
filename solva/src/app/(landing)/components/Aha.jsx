"use client"

import { motion, useScroll, useTransform, useInView, animate } from "framer-motion"
import { useRef, useEffect, useState } from "react"

/* ── Scroll-driven prose line ── */
function Line({ children, className = "" }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.93", "start 0.46"] })
  const opacity = useTransform(scrollYProgress, [0, 1], [0.08, 1])
  const y = useTransform(scrollYProgress, [0, 1], [12, 0])
  return (
    <motion.p ref={ref} style={{ opacity, y }} className={className}>
      {children}
    </motion.p>
  )
}

/* ── Animated counter ── */
function Counter({ to, suffix = "" }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.8 })
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!isInView) return
    const controls = animate(0, to, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(Math.round(v)),
    })
    return controls.stop
  }, [isInView, to])
  return <span ref={ref}>{val}{suffix}</span>
}

/* ── The file unlock visual ── */
function UnlockVisual() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.55 })

  const files = [
    { name: "Brand_identity_v3.ai", ext: "AI",  size: "4.2 MB", delay: 0.28 },
    { name: "Logo_finals.zip",       ext: "ZIP", size: "12.8 MB", delay: 0.42 },
    { name: "Style_guide.pdf",        ext: "PDF", size: "2.1 MB",  delay: 0.56 },
  ]

  return (
    <div ref={ref} className="relative w-full max-w-[360px] mx-auto md:mx-0">

      {/* Ambient glow behind card */}
      <motion.div
        className="absolute -inset-6 rounded-3xl blur-3xl"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.5, duration: 1.2 }}
        style={{ background: "radial-gradient(ellipse, rgba(29,158,117,0.18) 0%, transparent 70%)" }}
      />

      {/* Card */}
      <motion.div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0F0D28 0%, #0A0919 100%)",
          boxShadow: isInView
            ? "0 0 0 1px rgba(29,158,117,0.25), 0 32px 64px rgba(0,0,0,0.6)"
            : "0 0 0 1px rgba(83,74,183,0.2), 0 32px 64px rgba(0,0,0,0.6)",
          transition: "box-shadow 1s ease 0.3s",
        }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#080718] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF6059]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27C840]/80" />
          <div className="ml-3 flex-1 rounded-md bg-white/[0.04] px-3 py-1">
            <span className="text-[11px] text-[#3E3C5C]">solva.io/d/brand-kit-finals</span>
          </div>
          {/* Live status pill */}
          <motion.span
            className="ml-2 flex-shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            animate={isInView
              ? { color: "#1D9E75", borderColor: "rgba(29,158,117,0.35)", backgroundColor: "rgba(29,158,117,0.08)" }
              : { color: "#9694B8", borderColor: "rgba(83,74,183,0.25)", backgroundColor: "rgba(83,74,183,0.08)" }
            }
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            {isInView ? "Unlocked" : "Locked"}
          </motion.span>
        </div>

        {/* File list */}
        <div className="p-4 space-y-2.5">
          {files.map((file, i) => (
            <div key={file.name} className="relative overflow-hidden rounded-xl">
              {/* Base card */}
              <motion.div
                className="flex items-center gap-3 rounded-xl border p-3.5"
                animate={isInView
                  ? { borderColor: "rgba(29,158,117,0.2)", backgroundColor: "rgba(29,158,117,0.04)" }
                  : { borderColor: "rgba(83,74,183,0.16)", backgroundColor: "rgba(83,74,183,0.05)" }
                }
                transition={{ duration: 0.5, delay: file.delay }}
              >
                <motion.span
                  className="flex-shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold tracking-wider"
                  animate={isInView
                    ? { color: "#1D9E75", backgroundColor: "rgba(29,158,117,0.12)" }
                    : { color: "#7F77DD", backgroundColor: "rgba(83,74,183,0.12)" }
                  }
                  transition={{ duration: 0.4, delay: file.delay + 0.1 }}
                >
                  {file.ext}
                </motion.span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[12px] font-medium text-[#6E6C99]">{file.name}</p>
                  <p className="text-[10px] text-[#3E3C5C] mt-0.5">{file.size}</p>
                </div>
                {/* Lock → checkmark icon */}
                <motion.div className="flex-shrink-0 relative w-5 h-5">
                  <motion.svg
                    viewBox="0 0 20 20" fill="none" className="absolute inset-0 w-full h-full"
                    initial={{ opacity: 1 }} animate={isInView ? { opacity: 0 } : { opacity: 1 }}
                    transition={{ duration: 0.2, delay: file.delay }}
                  >
                    <rect x="5" y="9" width="10" height="8" rx="2" stroke="rgba(83,74,183,0.5)" strokeWidth="1.5"/>
                    <path d="M7 9V6.5a3 3 0 016 0V9" stroke="rgba(83,74,183,0.5)" strokeWidth="1.5"/>
                  </motion.svg>
                  <motion.svg
                    viewBox="0 0 20 20" fill="none" className="absolute inset-0 w-full h-full"
                    initial={{ opacity: 0, scale: 0.6 }} animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.35, delay: file.delay + 0.05, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <circle cx="10" cy="10" r="7" stroke="rgba(29,158,117,0.5)" strokeWidth="1.5"/>
                    <path d="M7 10l2 2 4-4" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </motion.svg>
                </motion.div>
              </motion.div>

              {/* Blur sweep */}
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(8,7,24,0.65)" }}
                initial={{ x: "0%" }}
                animate={isInView ? { x: "105%" } : { x: "0%" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: file.delay - 0.05 }}
              />
            </div>
          ))}
        </div>

        {/* Notification bar */}
        <motion.div
          className="border-t border-white/[0.05] px-4 py-3 flex items-center gap-2"
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.9 }}
        >
          <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#1D9E75]/20">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1D9E75]" />
          </span>
          <p className="text-[11px] text-[#1D9E75]">Payment received · All files unlocked · You've been notified</p>
        </motion.div>
      </motion.div>

      {/* Stats below card */}
      <motion.div
        className="mt-4 grid grid-cols-3 rounded-xl border border-white/[0.05] bg-white/[0.02] divide-x divide-white/[0.05] overflow-hidden"
        initial={{ opacity: 0, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 1.0 }}
      >
        {[
          { value: 0, suffix: "s",   label: "Delay" },
          { value: 100, suffix: "%", label: "Paid first" },
          { value: 0, suffix: " follow-ups", label: "Sent by you" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center py-3 px-2">
            <span className="text-sm font-bold text-white">
              {isInView ? <Counter to={s.value} suffix={s.suffix} /> : `0${s.suffix}`}
            </span>
            <span className="mt-0.5 text-center text-[10px] leading-tight text-[#3E3C5C]">{s.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

/* ── Main section ── */
export default function Aha() {
const lines = [
  { text: "A secure link is opened. Files are visible — blurred, locked, access restricted.", type: "body" },
  { text: "Payment is completed.", type: "body" },
  { text: "Within seconds — access unlocks.", type: "peak" },
  { text: "Every file becomes available instantly. Download access is granted automatically.", type: "body" },
  { text: "No manual steps. No back-and-forth. No uncertainty.", type: "body" },
  { text: "Delivery and payment happen in a single, seamless flow.", type: "bold" },
  { text: "That's how it should work.", type: "ghost" },
]

  return (
    <section className="relative overflow-hidden bg-[#07061A]">

      {/* Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(29,158,117,0.09) 0%, transparent 60%)" }} />
        <div className="absolute bottom-0 right-0 h-[400px] w-[500px]" style={{ background: "radial-gradient(ellipse at 100% 100%, rgba(83,74,183,0.07) 0%, transparent 60%)" }} />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1D9E75]/30 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 md:px-12 pt-28 pb-36 md:pt-36 md:pb-44">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 flex items-center gap-3"
        >
          <span className="h-px w-8 bg-[#1D9E75]" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#1D9E75]">The moment</span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 max-w-2xl text-[2rem] font-bold leading-[1.1] tracking-[-0.035em] text-white md:text-[2.8rem]"
        >
          This is what automated delivery with payment control feels like.
        </motion.h2>

        {/* Two-col layout */}
        <div className="grid grid-cols-1 gap-16 md:grid-cols-[1fr_1fr] md:gap-24 md:items-start">

          {/* Left: prose */}
          <div className="space-y-0">
            {lines.map((line, i) => (
              <Line
                key={i}
                className={[
                  "border-b border-white/[0.05] py-5 leading-[1.8]",
                  line.type === "peak"
                    ? "text-xl md:text-2xl font-bold tracking-[-0.02em] text-[#1D9E75] py-8 border-b-[#1D9E75]/10"
                    : line.type === "bold"
                    ? "text-base md:text-lg font-semibold text-white"
                    : line.type === "ghost"
                    ? "text-sm text-[#2E2C4A] border-b-0 pb-0"
                    : "text-base md:text-lg text-[#5E5C82]",
                ].join(" ")}
              >
                {line.text}
              </Line>
            ))}
          </div>

          {/* Right: sticky visual */}
          <div className="md:sticky md:top-24 md:pt-1">
            <UnlockVisual />
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#07061A] to-transparent" />
    </section>
  )
}