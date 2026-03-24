"use client"

import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef } from "react"
import { Ban, Lock, MessageSquareOff, Repeat } from "lucide-react"

const benefits = [
  {
    icon: Ban,
    title: "No manual payment follow-ups",
    body: "Access is automatically restricted until payment is completed. The system enforces it for you.",
    index: "01",
    accentColor: "#534AB7",
    accentGlow: "rgba(83,74,183,0.22)",
    accentBorder: "rgba(83,74,183,0.2)",
    accentBg: "rgba(83,74,183,0.08)",
  },
  {
    icon: Lock,
    title: "Files stay protected until payment",
    body: "All files remain locked and inaccessible until the required payment is successfully processed.",
    index: "02",
    accentColor: "#534AB7",
    accentGlow: "rgba(83,74,183,0.22)",
    accentBorder: "rgba(83,74,183,0.2)",
    accentBg: "rgba(83,74,183,0.08)",
  },
  {
    icon: MessageSquareOff,
    title: "No back-and-forth required",
    body: "Payment and access are handled within the same flow, eliminating the need for manual coordination.",
    index: "03",
    accentColor: "#534AB7",
    accentGlow: "rgba(83,74,183,0.22)",
    accentBorder: "rgba(83,74,183,0.2)",
    accentBg: "rgba(83,74,183,0.08)",
  },
  {
    icon: Repeat,
    title: "Works with your existing process",
    body: "Use the same workflow you already follow — simply deliver through a secure, payment-gated link.",
    index: "04",
    accentColor: "#1D9E75",
    accentGlow: "rgba(29,158,117,0.2)",
    accentBorder: "rgba(29,158,117,0.22)",
    accentBg: "rgba(29,158,117,0.07)",
  },
]

function BenefitCard({ benefit, i }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.35 })
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "start 0.4"] })
  const opacity = useTransform(scrollYProgress, [0, 0.45, 1], [0.05, 0.45, 1])
  const y = useTransform(scrollYProgress, [0, 1], [20, 0])
  const Icon = benefit.icon

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className="group relative"
    >
      {/* Card */}
      <div
        className="relative overflow-hidden rounded-2xl border p-7 md:p-8 transition-all duration-500 group-hover:border-opacity-60"
        style={{
          background: `linear-gradient(135deg, ${benefit.accentBg} 0%, rgba(14,12,37,0.5) 100%)`,
          borderColor: benefit.accentBorder,
        }}
      >
        {/* Corner glow blob */}
        <div
          className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{ background: benefit.accentColor }}
        />

        {/* Top row: number + icon */}
        <div className="mb-6 flex items-center justify-between">
          <span
            className="text-[10px] font-bold tracking-[0.22em] tabular-nums"
            style={{ color: benefit.accentColor }}
          >
            {benefit.index}
          </span>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110"
            style={{
              background: benefit.accentBg,
              borderColor: benefit.accentBorder,
              boxShadow: `0 0 20px ${benefit.accentGlow}`,
            }}
          >
            <Icon className="h-[17px] w-[17px]" style={{ color: benefit.accentColor }} strokeWidth={1.8} />
          </div>
        </div>

        {/* Text */}
        <h3 className="mb-3 text-lg font-bold leading-snug tracking-[-0.025em] text-white md:text-xl">
          {benefit.title}
        </h3>
        <p className="text-sm leading-[1.85] text-[#5E5C82] md:text-base">
          {benefit.body}
        </p>

        {/* Bottom accent line — grows in on view */}
        <motion.div
          className="absolute bottom-0 left-0 h-px"
          style={{ background: `linear-gradient(to right, ${benefit.accentColor}, transparent)` }}
          initial={{ width: "0%" }}
          animate={isInView ? { width: "60%" } : { width: "0%" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 + 0.2 }}
        />
      </div>
    </motion.div>
  )
}

export default function Benefits() {
  return (
    <section className="relative overflow-hidden bg-[#07061A]">

      {/* Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-0 right-0 h-[600px] w-[700px]"
          style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(83,74,183,0.12) 0%, transparent 60%)" }}
        />
        <div
          className="absolute bottom-0 left-0 h-[400px] w-[500px]"
          style={{ background: "radial-gradient(ellipse at 0% 100%, rgba(29,158,117,0.08) 0%, transparent 60%)" }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
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
          <span className="h-px w-8 bg-[#534AB7]" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#534AB7]">
            System benefits
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 max-w-xl text-[2rem] font-bold leading-[1.1] tracking-[-0.035em] text-white md:text-[2.8rem]"
        >
          What changes when access is automated
        </motion.h2>

        {/* 2×2 grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
          {benefits.map((b, i) => (
            <BenefitCard key={b.index} benefit={b} i={i} />
          ))}
        </div>

        {/* Closing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 max-w-2xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-12 bg-gradient-to-r from-[#534AB7] to-transparent" />
          </div>
          <p className="text-lg font-semibold leading-relaxed text-[#5E5C82] md:text-xl">
            Payment and delivery are handled together.{" "}
<span className="text-white">Access is granted only after payment is complete.</span>
          </p>
        </motion.div>

      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#07061A] to-transparent" />
    </section>
  )
}