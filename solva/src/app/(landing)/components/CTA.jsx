"use client"

import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"

const stagger = {
  show: { transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function CTA() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  // Parallax on the central glow
  const glowY = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#07061A]"
    >
      {/* ── Top separator ── */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#534AB7]/40 to-transparent" />

      {/* ── Background layers ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Central purple burst — parallaxes with scroll */}
        <motion.div
          style={{ y: glowY }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[900px]"
        >
          <div
            className="h-full w-full rounded-full blur-[120px]"
            style={{ background: "radial-gradient(ellipse, rgba(83,74,183,0.28) 0%, rgba(83,74,183,0.06) 50%, transparent 70%)" }}
          />
        </motion.div>
        {/* Soft green trace — bottom left */}
        <div
          className="absolute -bottom-20 -left-20 h-[300px] w-[400px] rounded-full blur-3xl"
          style={{ background: "rgba(29,158,117,0.07)" }}
        />
        {/* Noise grain */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "128px",
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative mx-auto max-w-4xl px-6 py-32 md:py-44 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col items-center"
        >

          {/* Scenario lines */}
          <motion.div variants={fadeUp} className="mb-10 space-y-1.5">
            <p className="text-base text-[#5E5C82] md:text-lg">You just finished a $4,000 brand project.</p>
            <p className="text-base text-[#5E5C82] md:text-lg">You're about to hit send.</p>
          </motion.div>

          {/* Decision headline */}
          <motion.h2
            variants={fadeUp}
            className="mb-14 max-w-2xl text-[2.2rem] font-bold leading-[1.08] tracking-[-0.04em] text-white md:text-[3.5rem]"
          >
            Is this the last time you send it{" "}
            <span className="bg-gradient-to-r from-[#A09FD4] to-[#7F77DD] bg-clip-text text-transparent">
              without leverage?
            </span>
          </motion.h2>

          {/* CTA button */}
          <motion.div variants={fadeUp}>
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <Link
                href="/login"
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl bg-[#534AB7] px-10 py-4 text-sm font-semibold text-white shadow-[0_0_48px_rgba(83,74,183,0.55)] transition-shadow duration-300 hover:shadow-[0_0_72px_rgba(83,74,183,0.75)] md:text-base"
              >
                {/* Shimmer sweep on hover */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                Try Solva free
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Sub-copy */}
          <motion.p
            variants={fadeUp}
            className="mt-5 text-sm text-[#3E3C5C]"
          >
            No credit card required
          </motion.p>

        </motion.div>
      </div>

      {/* ── Bottom cap — no fade, hard edge implies page end ── */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
    </section>
  )
}