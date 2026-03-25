// import { createMockPayment } from "./mock";
import { createDodoPayment } from "./dodo";

export async function createPayment(project) {
  const provider = process.env.PAYMENT_PROVIDER || "mock";

  if (provider === "dodo") {
    return await createDodoPayment(project);
  }

  // fallback
  return await createMockPayment(project);
}