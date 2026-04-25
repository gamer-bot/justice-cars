export function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = "234" + digits.slice(1);
  return digits;
}

interface WhatsAppLinkOpts {
  phone: string;
  carTitle: string;
  carPrice?: string;
  carUrl?: string;
}

export function buildWhatsAppLink({ phone, carTitle, carPrice, carUrl }: WhatsAppLinkOpts): string {
  const number = formatPhoneForWhatsApp(phone);
  const lines = [
    `Hi, I'm interested in your "${carTitle}" listing on Justice Cars.`,
    carPrice ? `Listed price: ${carPrice}.` : "",
    "Is it still available?",
    carUrl ? `\nListing: ${carUrl}` : "",
  ].filter(Boolean);
  const text = encodeURIComponent(lines.join(" "));
  return number
    ? `https://wa.me/${number}?text=${text}`
    : `https://wa.me/?text=${text}`;
}
