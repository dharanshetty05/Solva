import { createClient } from "@supabase/supabase-js";
import { createPayment } from "@/lib/payments";

export async function POST(req) {
  const { projectId } = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!project || error) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const { url, paymentId } = await createPayment(project);

  await supabase
    .from("projects")
    .update({
      payment_provider: "mock",
      payment_id: paymentId,
    })
    .eq("id", projectId);

  return Response.json({ url });
}