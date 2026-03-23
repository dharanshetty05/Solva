import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { uploadFile, saveFilesToDB } from "@/services/fileService"
import { supabase } from "@/lib/supabase"
import { getFilesByProject } from "@/services/fileService"
import { Lock, Upload, AlertCircle, CheckCircle2, Link2 } from "lucide-react"

/*
  ─── SOLVA BRAND PALETTE (from Brand Identity PDF) ───────────────
  Primary (indigo-purple):
    Solva 50:  #EEEDFE   Solva 400: #7F77DD
    Solva 600: #534AB7   Solva 800: #3C3489   Solva 900: #26215C

  Unlock (teal-green — paid/success state):
    Unlock 50: #E1F5EE   Unlock 400: #1D9E75  Unlock 800: #085041

  Locked (warm neutral — structural / locked state):
    Locked 50: #F1EFE8   Locked 400: #888780  Locked 900: #2C2C2A

  Usage rules (from state language spec):
    Lock icon  = awaiting payment (pending, not yet resolved)
    ✓ icon     = paid / unlocked
    Blur+dim   = locked files (visually inaccessible)
  ─────────────────────────────────────────────────────────────────
*/

const BRAND = {
  // Primary purple
  p50:  "#EEEDFE",
  p400: "#7F77DD",
  p600: "#534AB7",
  p900: "#26215C",
  // Unlock teal
  u50:  "#E1F5EE",
  u400: "#1D9E75",
  u800: "#085041",
  // Locked warm neutral
  l50:  "#F1EFE8",
  l400: "#888780",
  l900: "#2C2C2A",
  // Surface + border
  surface: "#FAFAF8",
  border:  "#E2E0DA",
  card:    "#FFFFFF",
}

/*
  State config — every visual token derived from BRAND.
  Array order = pipeline direction (index 0 → 2).
*/
const STATES = [
  {
    key:       "portal_sent",
    label:     "Locked",
    // Badge: warm neutral surface, muted text — restricted feel
    badgeBg:   `background: ${BRAND.l50}; border: 1px solid ${BRAND.border};`,
    badgeColor: BRAND.l400,
    dot:       BRAND.l400,
    // Row: no tint — default surface
    rowBg:     "transparent",
  },
  {
    key:       "awaiting_payment",
    label:     "Awaiting",
    // Badge: faint purple tint — pending, tensioned
    badgeBg:   `background: ${BRAND.p50}; border: 1px solid ${BRAND.p400}33;`,
    badgeColor: BRAND.p600,
    dot:       BRAND.p400,
    rowBg:     "transparent",
  },
  {
    key:       "paid",
    label:     "Paid",
    // Badge: teal — resolved, complete
    badgeBg:   `background: ${BRAND.u50}; border: 1px solid ${BRAND.u400}40;`,
    badgeColor: BRAND.u800,
    dot:       BRAND.u400,
    // Row: barely-there teal wash on paid — resolution, not celebration
    rowBg:     `${BRAND.u50}60`,
  },
]

const DB_TO_KEY = {
  portal_sent:      "portal_sent",
  awaiting_payment: "awaiting_payment",
  paid:             "paid",
}
const resolveKey   = (s) => DB_TO_KEY[s] ?? "portal_sent"
const resolveIndex = (s) => STATES.findIndex(st => st.key === resolveKey(s))
const resolveState = (s) => STATES[resolveIndex(s)]

const FILTERS = [
  { key: "all",              label: "All" },
  { key: "portal_sent",      label: "Locked" },
  { key: "awaiting_payment", label: "Awaiting" },
  { key: "paid",             label: "Paid" },
]

/* ─────────────────────────────────────────────────────────────────
   DashboardCard
───────────────────────────────────────────────────────────────── */
export default function DashboardCard({ projects, onNewProject }) {
  const [filter, setFilter] = useState("all")
  const [toast, setToast] = useState(null)
  const toastTimerRef = useRef(null)

  const showToast = (type, message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ type, message })
    toastTimerRef.current = setTimeout(() => setToast(null), 3000)
  }
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current) }, [])

  const active   = projects.filter(p => p.status !== "paid").length
  const paid     = projects.filter(p => p.status === "paid").reduce((s, p) => s + Number(p.invoice_amount || 0), 0)
  const awaiting = projects.filter(p => p.status === "awaiting_payment").reduce((s, p) => s + Number(p.invoice_amount || 0), 0)

  const counts = {
    all:               projects.length,
    portal_sent:       projects.filter(p => resolveKey(p.status) === "portal_sent").length,
    awaiting_payment:  projects.filter(p => p.status === "awaiting_payment").length,
    paid:              projects.filter(p => p.status === "paid").length,
  }

  const filtered = filter === "all"
    ? projects
    : projects.filter(p => resolveKey(p.status) === filter)

  return (
    /*
      Card: pure white surface, 1px warm border.
      No border-radius variation — consistent xl throughout.
    */
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${BRAND.border}`, background: BRAND.card }}
    >

      {/* ── Toast ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status" aria-live="polite"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.16, ease: "easeOut" }}
            className="fixed left-1/2 -translate-x-1/2 bottom-8 z-50"
          >
            <div
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[11px] font-medium shadow-[0_2px_16px_rgba(0,0,0,0.10)]"
              style={toast.type === "success"
                ? { background: BRAND.u50, border: `1px solid ${BRAND.u400}50`, color: BRAND.u800 }
                : { background: "#FEF2F2", border: "1px solid #FCA5A530", color: "#991B1B" }
              }
            >
              {toast.type === "success"
                ? <CheckCircle2 size={12} strokeWidth={2} />
                : <AlertCircle size={12} strokeWidth={2} />
              }
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Panel header ──────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-[18px]"
        style={{ borderBottom: `1px solid ${BRAND.border}` }}
      >
        <div>
          <h2
            className="text-[13px] leading-snug"
            style={{ fontWeight: 500, color: BRAND.l900, letterSpacing: "-0.01em" }}
          >
            My projects
          </h2>
          <p className="mt-0.5 text-[11px]" style={{ color: BRAND.l400 }}>
            Lock files. Share a link. Get paid.
          </p>
        </div>

        {/*
          New project: Solva 400 fill → 600 on hover.
          No box-shadow theatrics — the color does the work.
        */}
        <button
          type="button"
          onClick={onNewProject}
          className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[11px] font-medium text-white transition-all duration-150 active:scale-[0.97] focus-ring"
          style={{ background: BRAND.p400 }}
          onMouseEnter={e => e.currentTarget.style.background = BRAND.p600}
          onMouseLeave={e => e.currentTarget.style.background = BRAND.p400}
        >
          <span className="text-[14px] leading-none" style={{ fontWeight: 300 }}>+</span>
          New project
        </button>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      {/*
        Three cells on a slightly warmer surface (#F8F7F4).
        Dividers only — no card boxes within the card.
      */}
      <div
        className="grid grid-cols-3"
        style={{
          background: BRAND.l50,
          borderBottom: `1px solid ${BRAND.border}`,
          // Internal dividers via box-shadow on middle cell (avoids extra markup)
        }}
      >
        <StatCell label="Active"   value={active} />
        <StatCell label="Paid out" value={`₹${paid.toLocaleString()}`}     color={BRAND.u400} divider />
        <StatCell label="Awaiting" value={`₹${awaiting.toLocaleString()}`} color={BRAND.p400} divider />
      </div>

      {/* ── Filter tabs ───────────────────────────────────────────── */}
      <div
        className="flex px-5"
        style={{ borderBottom: `1px solid ${BRAND.border}`, background: BRAND.card }}
      >
        {FILTERS.map(f => {
          const isActive = filter === f.key
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className="relative flex items-center gap-1.5 px-2.5 py-[11px] text-[11px] transition-colors duration-100 whitespace-nowrap focus-ring rounded-none"
              style={{ fontWeight: isActive ? 500 : 400, color: isActive ? BRAND.l900 : BRAND.l400 }}
            >
              {f.label}

              {/* Count pill — inverts on active tab */}
              <span
                className="rounded-full px-1.5 py-px text-[9px] leading-none tabular-nums transition-all duration-100"
                style={isActive
                  ? { background: BRAND.l900, color: BRAND.card, fontWeight: 600 }
                  : { background: BRAND.border, color: BRAND.l400, fontWeight: 500 }
                }
              >
                {counts[f.key]}
              </span>

              {/* Spring-tracked underline in brand purple */}
              {isActive && (
                <motion.span
                  layoutId="tab-line"
                  className="absolute bottom-0 left-0 right-0 rounded-full"
                  style={{ height: "1.5px", background: BRAND.p600 }}
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* ── Project list ──────────────────────────────────────────── */}
      <div style={{ background: BRAND.card }}>
        <AnimatePresence mode="popLayout" initial={false}>
          {filtered.length === 0 ? (
            <EmptyState key="empty" onNewProject={filter === "all" ? onNewProject : null} filter={filter} />
          ) : (
            filtered.map(project => (
              <ProjectRow key={project.id} project={project} onToast={showToast} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   StatCell
───────────────────────────────────────────────────────────────── */
function StatCell({ label, value, color, divider }) {
  return (
    <div
      className="px-6 py-4"
      style={divider ? { borderLeft: `1px solid ${BRAND.border}` } : {}}
    >
      <p
        className="text-[10px] uppercase"
        style={{ letterSpacing: "0.10em", fontWeight: 500, color: BRAND.l400 }}
      >
        {label}
      </p>
      <p
        className="mt-1.5 text-[17px] leading-none"
        style={{ fontWeight: 500, color: color || BRAND.l900 }}
      >
        {value}
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   EmptyState
───────────────────────────────────────────────────────────────── */
function EmptyState({ onNewProject, filter }) {
  const msgs = {
    portal_sent:      { title: "No locked projects",       sub: "All projects have moved past this stage." },
    awaiting_payment: { title: "Nothing awaiting payment", sub: "No invoices are pending right now." },
    paid:             { title: "No paid projects yet",     sub: "Completed projects will appear here." },
    all:              { title: "No projects yet",          sub: "Create one to lock files behind payment." },
  }
  const { title, sub } = msgs[filter] ?? msgs.all

  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="px-6 py-16 flex flex-col items-center text-center"
    >
      {/* Lock icon centered in a neutral circle */}
      <div
        className="mb-5 flex h-10 w-10 items-center justify-center rounded-full"
        style={{ background: BRAND.l50, border: `1px solid ${BRAND.border}` }}
      >
        <Lock size={15} strokeWidth={1.5} style={{ color: BRAND.l400 }} />
      </div>
      <p className="text-[13px]" style={{ fontWeight: 500, color: BRAND.l900 }}>{title}</p>
      <p className="mt-1.5 text-[11px] max-w-[200px] leading-relaxed" style={{ color: BRAND.l400 }}>{sub}</p>
      {onNewProject && (
        <button
          type="button" onClick={onNewProject}
          className="mt-5 rounded-lg px-4 py-2 text-[11px] transition-colors duration-150 focus-ring"
          style={{ border: `1px solid ${BRAND.border}`, background: BRAND.l50, color: BRAND.l900, fontWeight: 500 }}
          onMouseEnter={e => e.currentTarget.style.background = BRAND.card}
          onMouseLeave={e => e.currentTarget.style.background = BRAND.l50}
        >
          Create first project
        </button>
      )}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   StatusPipeline
   Compact 3-step inline track using brand tokens.
   Past → filled teal check. Current → colored label pill.
   Future → dim warm dots. Connector fills as steps complete.
───────────────────────────────────────────────────────────────── */
function StatusPipeline({ status }) {
  const currentIdx = resolveIndex(status)

  return (
    <div className="flex items-center" aria-label={`Status: ${resolveState(status)?.label}`}>
      {STATES.map((state, i) => {
        const isPast    = i < currentIdx
        const isCurrent = i === currentIdx

        return (
          <div key={state.key} className="flex items-center">
            {/* Step */}
            <div
              className="flex items-center gap-1 rounded px-1.5 py-0.5 transition-all duration-300"
              style={isCurrent
                ? { cssText: state.badgeBg }  
                : {}
              }
            >
              {/*
                Using inline style objects — cssText workaround:
                apply badgeBg styles via a wrapper approach.
              */}
              <StepPill state={state} isPast={isPast} isCurrent={isCurrent} />
            </div>

            {/* Connector */}
            {i < STATES.length - 1 && (
              <span
                className="mx-1 block h-px w-3 rounded-full transition-all duration-500"
                style={{ background: isPast ? BRAND.u400 : BRAND.border, opacity: isPast ? 0.5 : 1 }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* Inner pill — isolated so inline styles apply cleanly */
function StepPill({ state, isPast, isCurrent }) {
  if (isPast) {
    return (
      <CheckCircle2 size={10} strokeWidth={2.5} style={{ color: BRAND.u400, opacity: 0.6 }} />
    )
  }

  const pillStyle = isCurrent
    ? { padding: "2px 6px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "4px" }
    : { display: "flex", alignItems: "center" }

  // Parse the badgeBg string into an object for current state
  const currentBg = isCurrent ? {
    background: state.key === "portal_sent" ? BRAND.l50
               : state.key === "awaiting_payment" ? BRAND.p50
               : BRAND.u50,
    border: state.key === "portal_sent" ? `1px solid ${BRAND.border}`
          : state.key === "awaiting_payment" ? `1px solid ${BRAND.p400}33`
          : `1px solid ${BRAND.u400}40`,
    ...pillStyle,
  } : pillStyle

  return (
    <span style={currentBg}>
      <span
        className="rounded-full transition-all duration-300"
        style={{
          width: "6px", height: "6px", flexShrink: 0,
          background: isCurrent ? state.dot : BRAND.border,
          opacity: isCurrent ? 1 : 0.35,
        }}
      />
      {isCurrent && (
        <span
          className="text-[10px] leading-none"
          style={{ fontWeight: 500, color: state.badgeColor, whiteSpace: "nowrap" }}
        >
          {state.label}
        </span>
      )}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────────
   PaidFlash
   Resolution animation — calm, not celebratory.
   A soft teal wash fades in and out (no bouncing, no burst).
   Duration shortened (600ms) from previous 900ms.
───────────────────────────────────────────────────────────────── */
function PaidFlash({ active }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="paid-flash"
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{ duration: 0.6, times: [0, 0.3, 1], ease: "easeInOut" }}
          style={{ background: BRAND.u50 }}
        />
      )}
    </AnimatePresence>
  )
}

/* ─────────────────────────────────────────────────────────────────
   ProjectRow
───────────────────────────────────────────────────────────────── */
function ProjectRow({ project, onToast }) {
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState([])
  const [copied, setCopied] = useState(false)

  const prevStatusRef = useRef(project.status)
  const [justPaid, setJustPaid] = useState(false)
  const isLocked = project.status !== "paid"
  const stateDef = resolveState(project.status)

  useEffect(() => {
    if (prevStatusRef.current !== "paid" && project.status === "paid") {
      setJustPaid(true)
      const t = setTimeout(() => setJustPaid(false), 650)
      return () => clearTimeout(t)
    }
    prevStatusRef.current = project.status
  }, [project.status])

  useEffect(() => {
    async function fetchFiles() {
      const { data } = await getFilesByProject(project.id)
      setFiles((data || []).map(f => ({
        tempId: `db-${f.id}`, id: f.id, status: "uploaded",
        file_name: f.file_name, file_size: f.file_size, file_path: f.file_path,
      })))
    }
    fetchFiles()
  }, [project.id])

  const fileKey          = (name, size) => `${name}::${size ?? 0}`
  const formatFileSizeKB = (bytes) => `${(Number(bytes || 0) / 1024).toFixed(1)} KB`
  const patchFile        = (tempId, patch) =>
    setFiles(prev => prev.map(f => f.tempId === tempId ? { ...f, ...patch } : f))

  const handleCopy = () => {
    navigator.clipboard.writeText(`${location.origin}/p/${project.portal_slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  /* ── Retry upload ─────────────────────────────────────────────── */
  const handleRetryUpload = async (tempId) => {
    const entry = files.find(f => f.tempId === tempId)
    if (!entry?.file || uploading) return
    setUploading(true)
    patchFile(tempId, { status: "uploading", errorMessage: null })
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) throw new Error("Not authenticated")
      const result = await uploadFile({ file: entry.file, userId: user.id, projectId: project.id })
      if (result.error) {
        patchFile(tempId, { status: "error", errorMessage: result.error?.message || "Upload failed. Try again." })
        onToast?.("error", "Upload failed. Try again.")
        return
      }
      const { data: inserted, error: insertError } = await saveFilesToDB([{ ...result, project_id: project.id, user_id: user.id }])
      if (insertError) {
        patchFile(tempId, { status: "error", errorMessage: "Upload failed. Try again." })
        onToast?.("error", "Upload failed. Try again.")
        return
      }
      const row = inserted?.[0]
      if (!row) throw new Error("Upload succeeded but DB row missing")
      patchFile(tempId, { status: "uploaded", id: row.id, file_name: row.file_name, file_size: row.file_size, file_path: row.file_path, errorMessage: null, file: undefined })
      onToast?.("success", "File uploaded successfully")
    } catch {
      patchFile(tempId, { status: "error", errorMessage: "Upload failed. Try again." })
      onToast?.("error", "Upload failed. Try again.")
    } finally {
      setUploading(false)
    }
  }

  /* ── File upload ──────────────────────────────────────────────── */
  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (!selectedFiles.length) return
    e.target.value = ""
    if (uploading) return
    const existingKeys = new Set(files.map(f => fileKey(f.file_name, f.file_size)))
    const nextSelections = selectedFiles.filter(f => !existingKeys.has(fileKey(f.name, f.size)))
    if (nextSelections.length === 0) return

    const now = Date.now()
    const tempEntries = nextSelections.map((file, idx) => ({
      tempId: `temp-${now}-${idx}-${Math.random().toString(16).slice(2)}`,
      status: "uploading", file, file_name: file.name, file_size: file.size, file_path: null, errorMessage: null,
    }))
    setFiles(prev => [...tempEntries, ...prev])
    setUploading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) throw new Error("Not authenticated")
      const payloadsToInsert = []
      const successfulTempIds = []
      let hadAnyError = false
      for (const temp of tempEntries) {
        const result = await uploadFile({ file: temp.file, userId: user.id, projectId: project.id })
        if (result.error) {
          hadAnyError = true
          patchFile(temp.tempId, { status: "error", errorMessage: result.error?.message || "Upload failed." })
          continue
        }
        successfulTempIds.push(temp.tempId)
        patchFile(temp.tempId, { file_path: result.file_path })
        payloadsToInsert.push({ ...result, project_id: project.id, user_id: user.id })
      }
      if (payloadsToInsert.length > 0) {
        const { data: inserted, error: insertError } = await saveFilesToDB(payloadsToInsert)
        if (insertError) {
          hadAnyError = true
          successfulTempIds.forEach(tempId => patchFile(tempId, { status: "error", errorMessage: "Upload failed. Try again." }))
        } else {
          const insertedByPath = new Map((inserted || []).map(row => [row.file_path, row]))
          setFiles(prev => prev.map(f => {
            if (f.status !== "uploading" || !f.file_path) return f
            const row = insertedByPath.get(f.file_path)
            if (!row) return f
            return { ...f, status: "uploaded", id: row.id, file_name: row.file_name, file_size: row.file_size, file_path: row.file_path, errorMessage: null, file: undefined }
          }))
        }
      }
      hadAnyError ? onToast?.("error", "Upload failed. Try again.") : onToast?.("success", "File uploaded successfully")
    } catch {
      tempEntries.forEach(temp => patchFile(temp.tempId, { status: "error", errorMessage: "Upload failed. Try again." }))
      onToast?.("error", "Upload failed. Try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative space-y-4 px-6 py-5 transition-colors duration-500"
      style={{
        borderTop: `1px solid ${BRAND.border}`,
        // Awaiting rows get a barely-visible purple left accent
        borderLeft: project.status === "awaiting_payment" ? `2px solid ${BRAND.p400}` : "2px solid transparent",
        // Paid rows: soft teal surface
        background: project.status === "paid" ? `${BRAND.u50}50` : "transparent",
      }}
    >
      {/* Paid resolution flash */}
      <PaidFlash active={justPaid} />

      {/* ── Project header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0 space-y-0.5">
          {/*
            Project name: heaviest text on the row.
            Weight 500 per brand typography scale.
          */}
          <p
            className="text-[13px] leading-snug truncate"
            style={{ fontWeight: 500, color: BRAND.l900, letterSpacing: "-0.01em" }}
          >
            {project.project_name}
          </p>
          <p className="text-[11px]" style={{ color: BRAND.l400 }}>
            Invoice · ₹{Number(project.invoice_amount).toLocaleString()}
          </p>
        </div>

        {/* Pipeline — state position, non-interactive */}
        <StatusPipeline status={project.status} />
      </div>

      {/* ── Lock / unlock notice ──────────────────────────────────── */}
      {project.status !== "paid" ? (
        <p className="text-[11px] leading-relaxed" style={{ color: BRAND.l400 }}>
          Files are locked. Client must pay to unlock.
        </p>
      ) : (
        /*
          Paid notice: teal, weight 500 — reads as confirmation, not alert.
          From brand state language: "Payment received" → "Unlocked"
        */
        <p className="text-[11px]" style={{ fontWeight: 500, color: BRAND.u400 }}>
          Payment received. Files unlocked.
        </p>
      )}

      {/* ── File list ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        {files.length === 0 ? (
          <p className="text-[11px] italic" style={{ color: BRAND.l400 }}>No files uploaded.</p>
        ) : (
          <AnimatePresence initial={false}>
            {files.map(file => {
              const isLockedFile = isLocked && file.status === "uploaded"
              return (
                <motion.div
                  key={file.tempId} layout
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.16, ease: "easeOut" }}
                  className="relative overflow-hidden rounded-lg"
                  style={{ border: `1px solid ${BRAND.border}`, background: BRAND.l50 }}
                >
                  <div className="px-4 py-3 space-y-0.5">
                    {/* File name — blurred when locked */}
                    <p
                      className="text-[12px] leading-snug"
                      style={{
                        fontWeight: 500,
                        color: isLockedFile ? BRAND.l400 : BRAND.l900,
                        filter: isLockedFile ? "blur(3px)" : "none",
                        userSelect: isLockedFile ? "none" : "auto",
                        pointerEvents: isLockedFile ? "none" : "auto",
                        transition: "filter 0.3s ease",
                      }}
                    >
                      {file.file_name}
                    </p>
                    {/* File size */}
                    <p
                      className="text-[11px]"
                      style={{
                        color: BRAND.l400,
                        filter: isLockedFile ? "blur(2px)" : "none",
                        userSelect: isLockedFile ? "none" : "auto",
                        pointerEvents: isLockedFile ? "none" : "auto",
                        transition: "filter 0.3s ease",
                      }}
                    >
                      {formatFileSizeKB(file.file_size)}
                    </p>

                    {/* Uploading indicator */}
                    {file.status === "uploading" && (
                      <div
                        className="mt-2 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[10px]"
                        style={{ background: BRAND.p50, border: `1px solid ${BRAND.p400}33`, color: BRAND.p600, fontWeight: 500 }}
                      >
                        <span
                          className="h-3 w-3 animate-spin rounded-full"
                          style={{ border: `2px solid ${BRAND.p400}40`, borderTopColor: BRAND.p600 }}
                        />
                        Uploading…
                      </div>
                    )}

                    {/* Error state */}
                    {file.status === "error" && (
                      <div className="mt-2 flex items-center gap-2.5">
                        <div className="flex items-center gap-1.5 text-[11px]" style={{ fontWeight: 500, color: "#991B1B" }}>
                          <AlertCircle size={11} strokeWidth={2} />
                          Upload failed
                        </div>
                        <button
                          type="button" disabled={uploading}
                          onClick={() => handleRetryUpload(file.tempId)}
                          className="rounded-md px-2.5 py-1 text-[10px] transition-colors focus-ring disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#991B1B", fontWeight: 500 }}
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {/* Uploaded + unlocked confirmation */}
                    {file.status === "uploaded" && !isLockedFile && (
                      <div className="mt-1 inline-flex items-center gap-1.5 text-[10px]" style={{ fontWeight: 500, color: BRAND.u400 }}>
                        <CheckCircle2 size={11} strokeWidth={2.5} />
                        Uploaded
                      </div>
                    )}
                  </div>

                  {/*
                    Lock overlay — inaccessible, not just labeled.
                    Tinted with Locked 50, not plain white. Feels restricted.
                    Brand spec: lock icon = awaiting state.
                  */}
                  <AnimatePresence>
                    {isLockedFile && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: `${BRAND.l50}CC`, backdropFilter: "blur(3px)" }}
                      >
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[10px]"
                          style={{
                            background: BRAND.card,
                            border: `1px solid ${BRAND.border}`,
                            color: BRAND.l400,
                            fontWeight: 500,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                          }}
                        >
                          <Lock size={10} strokeWidth={2} />
                          Locked until payment
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* ── Portal link ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Link2
            size={11} strokeWidth={1.75}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: BRAND.l400 }}
          />
          <input
            value={`${location.origin}/p/${project.portal_slug}`}
            readOnly
            className="w-full rounded-lg pl-8 pr-3 py-2 text-[11px] focus-ring font-mono"
            style={{
              border: `1px solid ${BRAND.border}`,
              background: BRAND.l50,
              color: BRAND.l400,
              letterSpacing: "-0.01em",
            }}
          />
        </div>

        {/*
          Copy button: text-only state change (Copy → Copied).
          Teal on success, purple-primary on idle.
        */}
        <button
          type="button" onClick={handleCopy}
          className="shrink-0 rounded-lg px-3.5 py-2 text-[11px] transition-all duration-150 active:scale-[0.97] focus-ring"
          style={copied
            ? { border: `1px solid ${BRAND.u400}50`, background: BRAND.u50, color: BRAND.u800, fontWeight: 500 }
            : { border: `1px solid ${BRAND.border}`, background: BRAND.l50, color: BRAND.p600, fontWeight: 500 }
          }
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* ── Upload zone ───────────────────────────────────────────── */}
      {/*
        Dashed border uses brand border color.
        Hover: slightly elevated surface (white), purple dashed accent.
        No generic "upload icon hero" — compact, inline.
      */}
      <div>
        <div
          className="rounded-lg px-4 py-[14px] text-center transition-all duration-150"
          style={{
            border: `1.5px dashed ${BRAND.border}`,
            background: BRAND.l50,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = BRAND.card
            e.currentTarget.style.border = `1.5px dashed ${BRAND.p400}60`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = BRAND.l50
            e.currentTarget.style.border = `1.5px dashed ${BRAND.border}`
          }}
        >
          <input
            type="file" multiple onChange={handleFileUpload}
            className="hidden" id={`upload-${project.id}`} disabled={uploading}
          />
          <label
            htmlFor={`upload-${project.id}`}
            className="inline-flex items-center gap-2 text-[11px] cursor-pointer"
            style={{
              color: uploading ? BRAND.l400 : BRAND.p600,
              fontWeight: 500,
              opacity: uploading ? 0.5 : 1,
              cursor: uploading ? "not-allowed" : "pointer",
            }}
          >
            <Upload size={11} strokeWidth={2} />
            Click to upload or drag files here
          </label>
        </div>

        {/* Uploading indicator below zone — pulse in purple */}
        {uploading && (
          <p
            className="mt-1.5 text-[10px] animate-pulse"
            style={{ color: BRAND.p400, fontWeight: 500 }}
          >
            Uploading files…
          </p>
        )}
      </div>
    </motion.div>
  )
}