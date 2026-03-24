"use client"

import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import { useState } from "react"

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
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)


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
            <p className="text-base text-[#5E5C82] md:text-lg">
  Your files are ready to be delivered.
</p>
<p className="text-base text-[#5E5C82] md:text-lg">
  Access is about to be shared.
</p>
          </motion.div>

          {/* Decision headline */}
          <motion.h2
            variants={fadeUp}
            className="mb-14 max-w-2xl text-[2.2rem] font-bold leading-[1.08] tracking-[-0.04em] text-white md:text-[3.5rem]"
          >
            Will you deliver files{" "}
<span className="bg-gradient-to-r from-[#A09FD4] to-[#7F77DD] bg-clip-text text-transparent">
  or control access?
</span>
          </motion.h2>

          {/* CTA button */}
          <motion.div variants={fadeUp}>
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >

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
          </motion.div>

          {/* Sub-copy */}
        { !submitted ? (
          <motion.p
            variants={fadeUp}
            className="mt-5 text-sm text-[#3E3C5C]"
          >
            Join the waitlist. No setup required.
          </motion.p>
          ) : <p></p>
        }

        </motion.div>
      </div>

      {/* ── Bottom cap — no fade, hard edge implies page end ── */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
    </section>
  )
}