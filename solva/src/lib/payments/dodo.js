import DodoPayments from "dodopayments";

const client = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  environment: "test_mode", // change to "live_mode" later
});

export async function createDodoPayment(project) {
    try {
    const session = await client.checkoutSessions.create({
      product_cart: [
        {
          product_id: process.env.DODO_PRODUCT_ID, // we'll set this next
          quantity: 1,
        },
      ],
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/p/${project.portal_slug}?paid=true&project_id=${project.id}`,
    });

    return {
      url: session.url,
      paymentId: session.session_id,
    };
  } catch (err) {
    console.error("Dodo payment error:", err);
    throw new Error("Failed to create Dodo payment session");
  }
}