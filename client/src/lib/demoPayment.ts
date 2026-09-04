export type DemoPaymentStatus = "pending" | "approved" | "rejected";
export type DemoPaymentAction = "approve" | "reject" | "reset";

export function nextDemoPaymentStatus(action: DemoPaymentAction): DemoPaymentStatus {
  if (action === "approve") return "approved";
  if (action === "reject") return "rejected";
  return "pending";
}

export function demoPaymentMessage(status: DemoPaymentStatus) {
  if (status === "approved") return "Demo approval complete. In production, the server approval RPC would activate the member’s access and create an audit event.";
  if (status === "rejected") return "Demo rejection complete. In production, the payment would remain rejected and the user would receive the rejection note.";
  return "This synthetic demo request is waiting for an administrator decision.";
}
