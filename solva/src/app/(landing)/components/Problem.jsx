"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

const lines = [
  {
    text: "The work is complete. Files are ready. Everything finalized and packaged for delivery.",
    size: "body",
  },
  { text: "You share access.", size: "body" },
  { text: "They open the files.", size: "body" },
  { text: "Then nothing.", size: "impact" },
  {
    text: "Access is granted before payment is completed. Once files are delivered, control is lost.",
    size: "body",
  },
  {
    text: "You follow up. You wait. The process becomes unpredictable and outside your control.",
    size: "body",
  },
  { text: "Access was given too early.", size: "callout" },
]

function ScrollLine({ text, size }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "start 0.48"],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [0.1, 0.6, 1])
  const y = useTransform(scrollYProgress, [0, 1], [10, 0])

  const isImpact = size === "impact"
  const isCallout = size === "callout"

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className={[
        "relative border-b border-white/[0.05]",
        isImpact ? "py-12 md:py-16" : "py-5 md:py-6",
      ].join(" ")}
    >
      {/* Left tick — only on impact line */}
      {isImpact && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(100%+20px)] hidden md:block w-6 h-px bg-[#534AB7]" />
      )}

      <p
        className={[
          isImpact
            ? "text-[clamp(2.4rem,7vw,4.5rem)] font-bold tracking-[-0.045em] leading-none text-white"
            : isCallout
            ? "text-xl md:text-2xl font-semibold leading-snug text-white"
            : "text-base md:text-lg leading-[1.75] text-[#5E5C82]",
        ].join(" ")}
      >
        {text}
      </p>
    </motion.div>
  )
}

export default function Problem() {
  const containerRef = useRef(null)

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-[#07061A]"
    >
      {/* ── Atmospheric background ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Top-left purple bloom */}
        <div
          className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(83,74,183,0.18) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        {/* Bottom-right dim accent */}
        <div
          className="absolute bottom-0 right-0 h-[400px] w-[500px]"
          style={{
            background:
              "radial-gradient(ellipse at 100% 100%, rgba(83,74,183,0.08) 0%, transparent 60%)",
          }}
        />
        {/* Horizontal scan line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#534AB7]/40 to-transparent" />
      </div>

      {/* ── Left rule ── */}
      <div className="pointer-events-none absolute left-[max(1.5rem,calc(50%-38rem))] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#534AB7]/25 to-transparent hidden md:block" />

      <div className="relative mx-auto max-w-4xl px-6 md:px-12 lg:pl-20 pt-28 pb-36 md:pt-36 md:pb-44">

        {/* ── Section eyebrow ── */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 flex items-center gap-3"
        >
          <span className="h-px w-8 bg-[#534AB7]" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#534AB7]">
            The problem
          </span>
        </motion.div>

        {/* ── Headline ── */}
        <motion.h2
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 max-w-2xl text-[2rem] font-bold leading-[1.1] tracking-[-0.035em] text-white md:text-[2.8rem]"
        >
          Access without control leads here.
        </motion.h2>

        {/* ── Scroll-animated lines ── */}
        <div className="max-w-2xl">
          {lines.map((line, i) => (
            <ScrollLine key={i} {...line} />
          ))}
        </div>

        {/* ── Closing statement ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 max-w-2xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-12 bg-gradient-to-r from-[#534AB7] to-transparent" />
          </div>
          <p className="text-lg font-semibold leading-relaxed text-[#5E5C82] md:text-xl">
            This isn't just about payments.{" "}
<span className="text-white">It's about controlling access to your files.</span>
          </p>
        </motion.div>

      </div>

      {/* ── Bottom fade to next section ── */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#07061A] to-transparent" />
    </section>
  )
}