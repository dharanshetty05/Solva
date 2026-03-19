import { createClient } from "@supabase/supabase-js"

export async function POST(req) {
    try {
        const { projectId } = await req.json()

        // Create admin client (server-side only)
        const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        // 1. Get project
        const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single()

        if (projectError || !project) {
        return Response.json({ error: "Project not found" }, { status: 404 })
        }

        // 2. Check payment
        if (!project.paid_at) {
        return Response.json(
            { error: "Payment required" },
            { status: 403 }
        )
        }

        // 3. Get files
        const { data: files } = await supabase
        .from("files")
        .select("*")
        .eq("project_id", projectId)

        if (!files || files.length === 0) {
            return Response.json({ files: [] })
        }

        // 4. Generate signed URLs (24h)
        const filesWithUrls = await Promise.all(
        files.map(async (file) => {
            const { data } = await supabase.storage
            .from("project-files")
            .createSignedUrl(file.file_path, 60 * 60 * 24)

            return {
            ...file,
            download_url: data?.signedUrl || null,
            }
        })
        )

        return Response.json({ files: filesWithUrls })
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 })
    }
}