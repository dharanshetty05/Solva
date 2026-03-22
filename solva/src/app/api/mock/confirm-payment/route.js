import { createClient } from "@supabase/supabase-js";
import { handlePaymentSuccess } from "@/lib/payments/handleWebhook";

export async function POST(req) {
  if (process.env.NODE_ENV === "production") {
    return new Response(
      JSON.stringify({ error: "Not allowed in production" }),
      { status: 403 }
    );
  }
  const { projectId } = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  await handlePaymentSuccess({ projectId, supabase });

  return Response.json({ success: true });
}