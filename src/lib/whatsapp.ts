const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919876543210";

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const WA_MESSAGES = {
  bookAssessment: (name?: string) =>
    `Hi, I'd like to book a Steer Score Assessment.${name ? ` My name is ${name}.` : ""} Could you help me with available slots?`,

  bookProgram: (programName: string) =>
    `Hi, I'm interested in booking the ${programName} program. Could you share more details and available cohort dates?`,

  generalEnquiry: () =>
    `Hi, I'd like to know more about SteerClub and how it works.`,

  membershipEnquiry: (tier: string) =>
    `Hi, I'm interested in the SteerClub ${tier} membership. Could you tell me more?`,

  corporateEnquiry: (company?: string) =>
    `Hi, I'm reaching out${company ? ` from ${company}` : ""} about SteerClub's corporate driving confidence programs.`,

  giftEnquiry: () =>
    `Hi, I'd like to gift a SteerClub assessment or program to someone. How does that work?`,
};

export async function sendWhatsAppNotification(
  to: string,
  message: string
): Promise<void> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) return;

  await fetch(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace(/\D/g, ""),
        type: "text",
        text: { body: message },
      }),
    }
  );
}
