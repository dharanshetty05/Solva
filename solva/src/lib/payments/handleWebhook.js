export async function handlePaymentSuccess({ projectId, supabase }) {
  console.log("Handling payment for:", projectId);

  // 1. FETCH project
  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .limit(1);

  const projectData = project?.[0];

  console.log("Fetched project:", projectData);
  console.log("Fetch error:", fetchError);

  if (!projectData) {
    console.log("❌ Project not found");
    return;
  }

  // 2. IDEMPOTENCY CHECK
  if (projectData.paid_at) {
    console.log("⚠️ Already paid");
    return;
  }

  // 3. UPDATE (ONLY ONCE)
  const { data: updateData, error: updateError } = await supabase
    .from("projects")
    .update({
      paid_at: new Date().toISOString(),
      status: "paid",
    })
    .eq("id", projectId);

  console.log("Update result:", updateData);
  console.log("Update error:", updateError);
}