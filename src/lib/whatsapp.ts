const PHONE = process.env.WHATSAPP_PHONE;
const APIKEY = process.env.WHATSAPP_APIKEY;

export async function notifyWhatsApp(text: string): Promise<void> {
  if (!PHONE || !APIKEY) return;
  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
      PHONE
    )}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(APIKEY)}`;
    await fetch(url, { signal: AbortSignal.timeout(5000) });
  } catch {
    // notification is best-effort; never throw
  }
}
