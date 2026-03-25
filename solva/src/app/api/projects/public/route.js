import { createClient } from "@supabase/supabase-js"

export async function POST(req) {
    try {
        const { slug } = await req.json()
        console.log("BACKEND RECEIVED SLUG:", slug)

        const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        // 1. Get project
        const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("portal_slug", slug)
        .single()

        if (!project) {
        return new Response(
            JSON.stringify({ error: "Project not found" }),
            { status: 404 }
        )
        }

        // 2. Get files
        const { data: files } = await supabase
        .from("files")
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })

        return new Response(
        JSON.stringify({
            project,
            files: files || [],
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