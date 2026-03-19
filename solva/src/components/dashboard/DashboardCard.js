export default function DashboardCard({ projects, onNewProject }) {
  const active = projects.filter(p => p.status !== "paid").length

  const paid = projects
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.invoice_amount || 0), 0)

  const awaiting = projects
    .filter((p) => p.status === "awaiting_payment")
    .reduce((sum, p) => sum + Number(p.invoice_amount || 0), 0)

  return (
    <div className="bg-white rounded-xl border p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">My projects</h2>

        <button
          onClick={onNewProject}
          className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
        >
          + New project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatBox label="active" value={active} />
        <StatBox label="paid out" value={`₹${paid.toLocaleString()}`} green />
        <StatBox label="awaiting" value={`₹${awaiting.toLocaleString()}`} yellow />
      </div>

      {/* List */}
      <div className="space-y-3">
        {projects.length === 0 ? (
          <p className="text-sm text-gray-500">No projects yet</p>
        ) : (
          projects.map((project) => (
            <ProjectRow key={project.id} project={project} />
        )))}
      </div>
    </div>
  )
}

function StatBox({ label, value, green, yellow }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`text-lg font-semibold ${
          green ? "text-green-600" : yellow ? "text-yellow-600" : ""
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function ProjectRow({ project }) {
  const getStatus = () => {
    if (project.status === "paid") {
      return (
        <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
          Paid · Delivered
        </span>
      )
    }

    if (project.status === "awaiting_payment") {
      return (
        <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
          Awaiting payment
        </span>
      )
    }

    return (
      <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700">
        Portal sent
      </span>
    )
  }

  return (
    <div className="flex items-center justify-between border-t pt-3">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-gray-400"></div>

        <p className="text-sm font-medium">{project.project_name}</p>
      </div>

      <div className="flex items-center gap-6">
        <p className="text-sm text-gray-600">
          ₹{Number(project.invoice_amount).toLocaleString()}
        </p>

        {getStatus()}
      </div>
    </div>
  )
}