import { supabase } from "@/lib/supabase"

export async function uploadFile({ file, userId, projectId }) {
    try {
        // 1. Generate unique file path
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}.${fileExt}`

        const filePath = `${userId}/${projectId}/${fileName}`

        // 2. Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(filePath, file)

        if (uploadError) {
        throw uploadError
        }

        // 3. Return metadata (NO URL)
        return {
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        }
    } catch (error) {
        console.error("Upload error:", error.message)
        return { error }
    }
}

export async function saveFilesToDB(filesData) {
    const { data, error } = await supabase
        .from("files")
        .insert(filesData)
        .select()

    return { data, error }
}

export async function getFilesByProject(projectId) {
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  return { data, error }
}