"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { Upload, Link2, Zap } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload your files",
    body: "Add any files you want to deliver. Solva secures them behind a private, payment-gated link.",
    accent: "#534AB7",
    accentDim: "rgba(83,74,183,0.12)",
    accentBorder: "rgba(83,74,183,0.22)",
    accentGlow: "rgba(83,74,183,0.35)",
    tag: "Secured",
    tagColor: "#A09FD4",
    tagBg: "rgba(83,74,183,0.12)",
    tagBorder: "rgba(83,74,183,0.2)",
  },
  {
    number: "02",
    icon: Link2,
    title: "Share a secure link",
    body: "Send a single link. Recipients can preview access, but files remain locked until payment is completed.",
    accent: "#534AB7",
    accentDim: "rgba(83,74,183,0.12)",
    accentBorder: "rgba(83,74,183,0.22)",
    accentGlow: "rgba(83,74,183,0.35)",
    tag: "Access controlled",
    tagColor: "#A09FD4",
    tagBg: "rgba(83,74,183,0.12)",
    tagBorder: "rgba(83,74,183,0.2)",
  },
  {
    number: "03",
    icon: Zap,
    title: "Payment completes. Access unlocks instantly.",
    body: "Once payment is successful, files are automatically unlocked. No manual steps, no delays.",
    accent: "#1D9E75",
    accentDim: "rgba(29,158,117,0.1)",
    accentBorder: "rgba(29,158,117,0.28)",
    accentGlow: "rgba(29,158,117,0.4)",
    tag: "Automated",
    tagColor: "#1D9E75",
    tagBg: "rgba(29,158,117,0.1)",
    tagBorder: "rgba(29,158,117,0.22)",
  },
]

function StepCard({ step, index }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.35"],
  })
  const opacity = useTransform(scrollYProgress, [0, 1], [0.08, 1])
  const y = useTransform(scrollYProgress, [0, 1], [32, 0])
  const Icon = step.icon

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className="relative grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-0"
    >
      {/* ── Left: number + icon ── */}
      <div className="flex md:flex-col md:items-start items-center gap-4 md:gap-5 pb-6 md:pb-0 md:pr-12 md:pt-1">

        {/* Step number */}
        <span
          className="text-[11px] font-bold tracking-[0.2em] tabular-nums"
          style={{ color: step.accent }}
        >
          {step.number}
        </span>

        {/* Icon node */}
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border"
          style={{
            background: step.accentDim,
            borderColor: step.accentBorder,
            boxShadow: `0 0 28px ${step.accentGlow}`,
          }}
        >
          <Icon className="h-[18px] w-[18px]" style={{ color: step.accent }} strokeWidth={1.8} />
        </div>

        {/* State tag */}
        <span
          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            color: step.tagColor,
            background: step.tagBg,
            borderColor: step.tagBorder,
          }}
        >
          {step.tag}
        </span>
      </div>

      {/* ── Right: content card ── */}
      <div
        className="rounded-2xl border p-7 md:p-9 transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${step.accentDim} 0%, rgba(14,12,37,0.6) 100%)`,
          borderColor: step.accentBorder,
        }}
      >
        <h3 className="mb-3 text-xl font-bold leading-snug tracking-[-0.02em] text-white md:text-2xl">
          {step.title}
        </h3>
        <p className="text-base leading-[1.8] text-[#5E5C82]">
          {step.body}
        </p>

        {/* Decorative corner accent */}
        <div
          className="absolute bottom-5 right-5 h-16 w-16 rounded-full opacity-20 blur-2xl"
          style={{ background: step.accent }}
        />
      </div>
    </motion.div>
  )
}

export default function Solution() {
  return (
    <section className="relative overflow-hidden bg-[#07061A]">

      {/* ── Background ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-0 right-0 h-[500px] w-[700px]"
          style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(83,74,183,0.13) 0%, transparent 60%)" }}
        />
        <div
          className="absolute bottom-0 left-0 h-[400px] w-[500px]"
          style={{ background: "radial-gradient(ellipse at 0% 100%, rgba(29,158,117,0.09) 0%, transparent 60%)" }}
        />
        {/* Vertical connector glow column */}
        <div
          className="absolute left-[max(1.5rem,calc(50%-38rem))] top-48 bottom-48 w-px hidden md:block"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(83,74,183,0.3) 30%, rgba(83,74,183,0.2) 60%, rgba(29,158,117,0.25) 85%, transparent)" }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 md:px-12 lg:pl-20 pt-28 pb-36 md:pt-36 md:pb-44">

        {/* ── Eyebrow ── */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 flex items-center gap-3"
        >
          <span className="h-px w-8 bg-[#534AB7]" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#534AB7]">
            How it works — fully automated
          </span>
        </motion.div>

        {/* ── Headline ── */}
        <motion.h2
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 max-w-xl text-[2rem] font-bold leading-[1.1] tracking-[-0.035em] text-white md:text-[2.8rem]"
        >
          How Solva works
        </motion.h2>

        {/* ── Step cards ── */}
        <div className="relative space-y-6 md:space-y-8">
          {steps.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} />
          ))}
        </div>

        {/* ── Closing statement ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 max-w-2xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-12 bg-gradient-to-r from-[#534AB7] to-transparent" />
          </div>
          <p className="text-lg font-semibold leading-relaxed text-[#5E5C82] md:text-xl">
            Nothing about your workflow changes.{" "}
<span className="text-white">Access is simply controlled until payment is complete.</span>
          </p>
        </motion.div>

      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#07061A] to-transparent" />
    </section>
  )
}