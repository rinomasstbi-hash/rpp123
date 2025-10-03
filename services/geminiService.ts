import type { RPMInput } from '../types.ts';

export const generateRPM = async (data: RPMInput): Promise<string> => {
    const response = await fetch('/.netlify/functions/generate-rpm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorBody;
      try {
        errorBody = await response.json();
        const errorMessage = errorBody.error || 'Terjadi kesalahan pada server.';
        const errorDetails = errorBody.details ? ` Detail teknis: ${errorBody.details}` : '';
        throw new Error(`${errorMessage}${errorDetails}`);
      } catch (e) {
        // If parsing JSON fails, it's likely a gateway error or non-JSON response
        throw new Error(`Server mengalami masalah (Status: ${response.status} ${response.statusText}). Silakan coba lagi nanti.`);
      }
    }

    const result = await response.json();
    return result.rpm;
};
