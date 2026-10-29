'use server';

export async function verifyAdminPin(pin: string): Promise<{ success: boolean; error?: string }> {
  const expectedPin = process.env.ADMIN_PIN || '1234';
  if (pin.trim() === expectedPin.trim()) {
    return { success: true };
  }
  return { success: false, error: 'PIN errato, giù le mani! 🐾' };
}
