const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;
const OWNER_EMAIL = "speak2justicechibueze@gmail.com";

interface InquiryEmailData {
  carTitle: string;
  carId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  message: string;
}

export async function sendInquiryEmail(data: InquiryEmailData): Promise<void> {
  if (!WEB3FORMS_KEY) {
    console.warn("[notify] VITE_WEB3FORMS_KEY not set — skipping email notification.");
    return;
  }

  const subject = `New inquiry: ${data.carTitle}`;
  const body =
    `You have a new inquiry on Justice Cars.\n\n` +
    `Car: ${data.carTitle}\n` +
    `Car ID: ${data.carId}\n\n` +
    `From: ${data.buyerName}\n` +
    `Email: ${data.buyerEmail}\n` +
    `Phone: ${data.buyerPhone || "(not provided)"}\n\n` +
    `Message:\n${data.message}\n\n` +
    `Open your admin panel to mark this as paid once payment arrives.`;

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject,
        from_name: "Justice Cars Website",
        email: OWNER_EMAIL,
        replyto: data.buyerEmail,
        message: body,
        botcheck: "",
      }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("[notify] Web3Forms responded with error:", res.status, txt);
    }
  } catch (e) {
    console.error("[notify] Email send failed (inquiry was still saved):", e);
  }
}
