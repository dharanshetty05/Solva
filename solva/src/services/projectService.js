import { supabase } from "@/lib/supabase"

export async function getProjects() {
    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })

    return { data, error }
}

export async function createProject(userId, projectData) {
    const { data, error } = await supabase
        .from("projects")
        .insert([
        {
            user_id: userId,
            ...projectData,
        },
        ])
        .select()

    return { data, error }
    }