
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { RPMForm } from './components/RPMForm.tsx';
import { RPMOutput } from './components/RPMOutput.tsx';
import { Spinner } from './components/Spinner.tsx';
import { generateRPM } from './services/geminiService.ts';
import type { RPMInput } from './types.ts';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedRpm, setGeneratedRpm] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = useCallback(async (data: RPMInput) => {
    setIsLoading(true);
    setGeneratedRpm('');
    setError(null);
    try {
      const result = await generateRPM(data);
      setGeneratedRpm(result);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setError(`Gagal menghasilkan RPM. ${e.message}`);
      } else {
        setError('Gagal menghasilkan RPM. Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-teal-700 mb-4">Formulir Input Rencana Pembelajaran</h2>
            <p className="mb-6 text-gray-600">Isi semua kolom di bawah ini untuk menghasilkan Rencana Pembelajaran Mendalam (RPM) secara otomatis.</p>
            <RPMForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
             <h2 className="text-2xl font-bold text-teal-700 mb-4">Hasil Rencana Pembelajaran (RPM)</h2>
            {isLoading && <Spinner />}
            {error && <div className="text-red-500 bg-red-100 p-4 rounded-md whitespace-pre-wrap">{error}</div>}
            {!isLoading && !generatedRpm && !error && (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Output RPM akan ditampilkan di sini setelah formulir diisi dan dikirimkan.</p>
                </div>
            )}
            {generatedRpm && <RPMOutput htmlContent={generatedRpm} />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
