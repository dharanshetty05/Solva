"use client"

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import { Plus, Minus } from "lucide-react"

const qas = [
  {
    q: "Will recipients understand how this works?",
    a: "They see a simple, secure page. Access is unlocked automatically after payment. No account or setup required.",
    index: "01",
  },
  {
    q: "Is file access secure?",
    a: "All files are protected and remain inaccessible until payment is successfully completed. Access is controlled at the system level.",
    index: "02",
  },
  {
    q: "Does this change how delivery works?",
    a: "No. You continue your normal workflow, but delivery happens through a secure, payment-gated link instead of direct file transfer.",
    index: "03",
  },
  {
    q: "What happens if payment is not completed?",
    a: "Access remains locked. Files are never delivered unless the required payment is successfully processed.",
    index: "04",
  },
]

function AccordionItem({ qa, isOpen, onToggle, i }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "start 0.5"] })
  const opacity = useTransform(scrollYProgress, [0, 1], [0.06, 1])
  const y = useTransform(scrollYProgress, [0, 1], [14, 0])

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className="group border-b border-white/[0.07] last:border-b-0"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-6 py-7 text-left"
      >
        {/* Left: index + question */}
        <div className="flex items-start gap-5">
          <span className="mt-[3px] flex-shrink-0 text-[10px] font-bold tracking-[0.2em] tabular-nums text-[#534AB7]">
            {qa.index}
          </span>
          <span
            className={[
              "text-base font-semibold leading-snug tracking-[-0.015em] transition-colors duration-200 md:text-lg",
              isOpen ? "text-white" : "text-[#9B98C0] group-hover:text-white",
            ].join(" ")}
          >
            {qa.q}
          </span>
        </div>

        {/* Toggle icon */}
        <div
          className={[
            "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-300",
            isOpen
              ? "border-[rgba(83,74,183,0.5)] bg-[rgba(83,74,183,0.15)] text-[#7F77DD]"
              : "border-white/[0.1] bg-white/[0.03] text-[#3E3C5C] group-hover:border-[rgba(83,74,183,0.3)] group-hover:text-[#7F77DD]",
          ].join(" ")}
        >
          {isOpen
            ? <Minus className="h-3 w-3" strokeWidth={2.5} />
            : <Plus className="h-3 w-3" strokeWidth={2.5} />
          }
        </div>
      </button>

      {/* Answer */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pl-[calc(1.5rem+1.25rem)] pb-8 pr-10">
              {/* Accent left bar */}
              <div className="relative pl-5 border-l border-[rgba(83,74,183,0.3)]">
                <p className="text-base leading-[1.85] text-[#5E5C82] md:text-base">
                  {qa.a}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Trust() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="relative overflow-hidden bg-[#07061A]">

      {/* Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-0 left-0 h-[500px] w-[600px]"
          style={{ background: "radial-gradient(ellipse at 0% 0%, rgba(83,74,183,0.1) 0%, transparent 60%)" }}
        />
        <div
          className="absolute bottom-0 right-0 h-[350px] w-[450px]"
          style={{ background: "radial-gradient(ellipse at 100% 100%, rgba(83,74,183,0.07) 0%, transparent 60%)" }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 md:px-12 lg:pl-20 pt-28 pb-36 md:pt-36 md:pb-44">

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
            Common questions
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
          Everything you need to know
        </motion.h2>

        {/* Accordion */}
        <div className="max-w-2xl rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 md:px-8">
          {qas.map((qa, i) => (
            <AccordionItem
              key={qa.index}
              qa={qa}
              i={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>

      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#07061A] to-transparent" />
    </section>
  )
}