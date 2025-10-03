import type { RPMInput } from '../types.ts';

export const generateRPM = async (data: RPMInput): Promise<string> => {
  try {
    // Panggil endpoint Netlify Function yang akan kita buat
    const response = await fetch('/.netlify/functions/generate-rpm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Gagal menghasilkan RPM dari server.');
    }

    const result = await response.json();
    return result.rpm;
    
  } catch (error) {
    console.error("Error calling Netlify Function:", error);
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("Gagal terhubung ke layanan AI.");
  }
};
