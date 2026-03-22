import { createClient } from "@supabase/supabase-js"

export async function POST(req) {
    try {
        const { projectId, portalSlug, fileId } = await req.json()

        const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        // 1. Validate project
        const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .eq("portal_slug", portalSlug)
        .single()

        if (projectError || !project) {
        return new Response(
            JSON.stringify({ error: "Invalid project access" }),
            { status: 403 }
        )
        }

        if (!project.paid_at) {
        return new Response(
            JSON.stringify({ error: "Payment required" }),
            { status: 403 }
        )
        }

        // 2. Get ONE file
        const { data: file } = await supabase
        .from("files")
        .select("*")
        .eq("id", fileId)
        .eq("project_id", projectId)
        .single()

        if (!file) {
        return new Response(
            JSON.stringify({ error: "File not found" }),
            { status: 404 }
        )
        }

        // 3. Generate signed URL (10 min instead of 24h)
        const { data } = await supabase.storage
        .from("project-files")
        .createSignedUrl(file.file_path, 60 * 10)

        return new Response(
        JSON.stringify({
            download_url: data?.signedUrl || null,
        }),
        { status: 200 }
        )
    } catch (err) {
        return new Response(
        JSON.stringify({ error: err.message }),
        { status: 500 }
        )
    }
}