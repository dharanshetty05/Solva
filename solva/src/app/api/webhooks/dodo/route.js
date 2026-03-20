import { createClient } from "@supabase/supabase-js";
import { handlePaymentSuccess } from "@/lib/payments/handleWebhook";

export async function POST(req) {
  try {
    const body = await req.json();

    // 👇 TEMP: log everything
    console.log("Dodo Webhook:", body);

    // 👇 We'll replace this later with real event parsing
    const projectId = body?.data?.metadata?.project_id;

    if (!projectId) {
      return new Response("No project_id", { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    await handlePaymentSuccess({ projectId, supabase });

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Error", { status: 500 });
  }
}