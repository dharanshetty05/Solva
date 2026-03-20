export async function createMockPayment(project) {
  return {
    url: `/p/${project.portal_slug}?mock_payment=true`,
    paymentId: "mock_" + project.id,
  };
}