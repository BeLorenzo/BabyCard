'use server';

async function sendTelegramMessage(text: string): Promise<{ success: boolean }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("Variabili Telegram mancanti. Hai impostato il file .env?");
    return { success: false };
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      console.error("Errore da Telegram:", await response.text());
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("Errore di rete durante l'invio:", error);
    return { success: false };
  }
}

export async function sendEmergencyAlert() {
  const text = `🚨 *ALLARME ROSSO* 🚨\n\nFiansata richiede attenzione immediata. Intervenire.`;
  return sendTelegramMessage(text);
}

export async function sendBookRequestAlert(message: string) {
  return sendTelegramMessage(message);
}
