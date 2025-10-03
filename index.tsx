import React, { useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// === DARI types.ts ===
enum PedagogicalPractice {
  INQUIRY_DISCOVERY = 'Inkuiri-Discovery',
  PJBL = 'PjBL',
  PROBLEM_SOLVING = 'Problem Solving',
  GAME_BASED = 'Game Based Learning',
  STATION_LEARNING = 'Station Learning',
}

enum GraduateDimension {
  FAITH = 'Keimanan & Ketakwaan',
  CITIZENSHIP = 'Kewargaan',
  CRITICAL_REASONING = 'Penalaran Kritis',
  CREATIVITY = 'Kreativitas',
  COLLABORATION = 'Kolaborasi',
  INDEPENDENCE = 'Kemandirian',
  HEALTH = 'Kesehatan',
  COMMUNICATION = 'Komunikasi',
}

interface RPMInput {
  teacherName: string;
  teacherNip: string;
  className: string;
  subject: string;
  learningObjectives: string;
  subjectMatter: string;
  language: 'Bahasa Inggris' | 'Bahasa Arab';
  meetings: number;
  pedagogicalPractices: PedagogicalPractice[];
  graduateDimensions: GraduateDimension[];
}

// === DARI constants.ts ===
const PEDAGOGICAL_PRACTICES: PedagogicalPractice[] = [
  PedagogicalPractice.INQUIRY_DISCOVERY,
  PedagogicalPractice.PJBL,
  PedagogicalPractice.PROBLEM_SOLVING,
  PedagogicalPractice.GAME_BASED,
  PedagogicalPractice.STATION_LEARNING,
];

const GRADUATE_DIMENSIONS: GraduateDimension[] = [
  GraduateDimension.FAITH,
  GraduateDimension.CITIZENSHIP,
  GraduateDimension.CRITICAL_REASONING,
  GraduateDimension.CREATIVITY,
  GraduateDimension.COLLABORATION,
  GraduateDimension.INDEPENDENCE,
  GraduateDimension.HEALTH,
  GraduateDimension.COMMUNICATION,
];

// === DARI services/geminiService.ts ===
const generateRPM = async (data: RPMInput): Promise<string> => {
  try {
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

// === DARI components/Header.tsx ===
const Header: React.FC = () => {
    return (
        <header className="bg-teal-800 shadow-md">
            <div className="container mx-auto px-4 py-4 flex items-center">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Kementerian_Agama_new_logo.png/330px-Kementerian_Agama_new_logo.png" alt="Logo Kemenag" className="h-12 w-12 mr-4" />
                <div>
                    <h1 className="text-2xl font-bold text-white">RPM KBC Generator</h1>
                    <p className="text-md text-teal-200">MTsN 4 Jombang</p>
                </div>
            </div>
        </header>
    );
};

// === DARI components/Footer.tsx ===
const Footer: React.FC = () => {
    return (
        <footer className="bg-white mt-8 py-4 border-t">
            <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} MTsN 4 Jombang. Didukung oleh Teknologi AI Generatif.</p>
            </div>
        </footer>
    );
};

// === DARI components/Spinner.tsx ===
const Spinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-600">AI sedang membuat Rencana Pembelajaran...</p>
  </div>
);

// === DARI components/RPMOutput.tsx ===
interface RPMOutputProps {
  htmlContent: string;
}

const RPMOutput: React.FC<RPMOutputProps> = ({ htmlContent }) => {
  const handleCopyToGoogleDocs = useCallback(() => {
    const outputElement = document.getElementById('rpm-output-content');
    if (outputElement) {
      let contentForClipboard = outputElement.innerHTML;
      
      contentForClipboard = contentForClipboard.replace(/border: 1px solid #ddd/g, 'border: 1px solid #000');
      contentForClipboard = contentForClipboard.replace(/background-color: #f2f2f2/g, 'background-color: #e0e0e0');

      const html = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #000 !important; }
                table { border-collapse: collapse; width: 100%; }
                td, th { vertical-align: top; padding: 8px; }
                .page-break { page-break-before: always; }
            </style>
          </head>
          <body>${contentForClipboard}</body>
        </html>
      `;
      
      const blob = new Blob([html], { type: 'text/html' });
      const clipboardItem = new ClipboardItem({ 'text/html': blob });

      navigator.clipboard.write([clipboardItem]).then(() => {
        alert('Konten berhasil disalin! Buka Google Dokumen dan tempel (Ctrl+V/Cmd+V).');
        window.open('https://docs.google.com/document/create', '_blank');
      }).catch(err => {
        console.error('Gagal menyalin konten HTML: ', err);
        const plainText = outputElement.innerText;
        navigator.clipboard.writeText(plainText).then(() => {
            alert('Konten disalin sebagai teks biasa. Buka Google Dokumen dan tempel.');
            window.open('https://docs.google.com/document/create', '_blank');
        }).catch(err2 => {
            console.error('Gagal menyalin teks biasa: ', err2);
            alert('Gagal menyalin konten. Silakan coba salin manual.');
        });
      });
    }
  }, []);

  return (
    <div className="space-y-4">
      <button
        onClick={handleCopyToGoogleDocs}
        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
          <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h6a2 2 0 00-2-2H5z" />
        </svg>
        Salin & Buka di Google Dokumen
      </button>
      <div 
        id="rpm-output-content"
        className="border border-gray-300 rounded-md p-4 bg-white overflow-auto h-[70vh]"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

// === DARI components/RPMForm.tsx ===
interface RPMFormProps {
  onSubmit: (data: RPMInput) => void;
  isLoading: boolean;
}

const InputField: React.FC<{ id: string, label: string, type?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, required?: boolean }> = ({ id, label, type = "text", value, onChange, required = true }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900"
    />
  </div>
);

const TextareaField: React.FC<{ id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, rows?: number }> = ({ id, label, value, onChange, rows = 3 }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      required
      rows={rows}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900"
    />
  </div>
);


const RPMForm: React.FC<RPMFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<RPMInput>({
    teacherName: '',
    teacherNip: '',
    className: 'VII',
    subject: '',
    learningObjectives: '',
    subjectMatter: '',
    language: 'Bahasa Arab',
    meetings: 1,
    pedagogicalPractices: [PEDAGOGICAL_PRACTICES[0]],
    graduateDimensions: [],
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof RPMInput, string>>>({});

  useEffect(() => {
    const numMeetings = formData.meetings > 0 ? formData.meetings : 1;
    setFormData(prev => ({
      ...prev,
      pedagogicalPractices: Array.from({ length: numMeetings }, (_, i) => prev.pedagogicalPractices[i] || PEDAGOGICAL_PRACTICES[0])
    }));
  }, [formData.meetings]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'meetings' ? parseInt(value, 10) : value }));
  }, []);

  const handlePracticeChange = useCallback((index: number, value: PedagogicalPractice) => {
    setFormData(prev => {
      const newPractices = [...prev.pedagogicalPractices];
      newPractices[index] = value;
      return { ...prev, pedagogicalPractices: newPractices };
    });
  }, []);

  const handleDimensionChange = useCallback((dimension: GraduateDimension) => {
    setFormData(prev => {
      const newDimensions = prev.graduateDimensions.includes(dimension)
        ? prev.graduateDimensions.filter(d => d !== dimension)
        : [...prev.graduateDimensions, dimension];
      return { ...prev, graduateDimensions: newDimensions };
    });
  }, []);

  const validateForm = () => {
      const newErrors: Partial<Record<keyof RPMInput, string>> = {};
      if (!formData.teacherName.trim()) newErrors.teacherName = "Nama Guru wajib diisi.";
      if (!formData.teacherNip.trim()) newErrors.teacherNip = "NIP Guru wajib diisi.";
      if (!formData.subject.trim()) newErrors.subject = "Mata Pelajaran wajib diisi.";
      if (!formData.learningObjectives.trim()) newErrors.learningObjectives = "Tujuan Pembelajaran wajib diisi.";
      if (!formData.subjectMatter.trim()) newErrors.subjectMatter = "Materi Pelajaran wajib diisi.";
      if (formData.meetings < 1) newErrors.meetings = "Jumlah Pertemuan minimal 1.";
      if (formData.graduateDimensions.length === 0) newErrors.graduateDimensions = "Pilih minimal satu Dimensi Lulusan.";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
        onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InputField id="teacherName" label="Nama Guru" value={formData.teacherName} onChange={handleChange} />
      <InputField id="teacherNip" label="NIP Guru" type="text" value={formData.teacherNip} onChange={handleChange} />
      
      <div>
        <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
        <select id="className" name="className" value={formData.className} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900">
          <option>VII</option>
          <option>VIII</option>
          <option>IX</option>
        </select>
      </div>

      <InputField id="subject" label="Mata Pelajaran" value={formData.subject} onChange={handleChange} />
      <TextareaField id="learningObjectives" label="Tujuan Pembelajaran" value={formData.learningObjectives} onChange={handleChange} />
      <TextareaField id="subjectMatter" label="Materi Pelajaran" value={formData.subjectMatter} onChange={handleChange} />

      <div>
        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Bahasa Pembuka/Penutup</label>
        <select id="language" name="language" value={formData.language} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900">
          <option>Bahasa Arab</option>
          <option>Bahasa Inggris</option>
        </select>
      </div>
      
      <InputField id="meetings" label="Jumlah Pertemuan" type="number" value={formData.meetings.toString()} onChange={handleChange} />
       {errors.meetings && <p className="text-red-500 text-sm">{errors.meetings}</p>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Praktik Pedagogis per Pertemuan</label>
        <div className="space-y-2">
        {Array.from({ length: formData.meetings > 0 ? formData.meetings : 1 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600 w-24">Pertemuan {index + 1}:</span>
                <select 
                    value={formData.pedagogicalPractices[index] || ''}
                    onChange={(e) => handlePracticeChange(index, e.target.value as PedagogicalPractice)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900"
                >
                    {PEDAGOGICAL_PRACTICES.map(practice => <option key={practice} value={practice}>{practice}</option>)}
                </select>
            </div>
        ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dimensi Lulusan (Pilih beberapa)</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {GRADUATE_DIMENSIONS.map(dim => (
            <label key={dim} className="flex items-center space-x-2">
              <input 
                type="checkbox"
                checked={formData.graduateDimensions.includes(dim)}
                onChange={() => handleDimensionChange(dim)}
                className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-gray-600">{dim}</span>
            </label>
          ))}
        </div>
         {errors.graduateDimensions && <p className="text-red-500 text-sm mt-2">{errors.graduateDimensions}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? 'Memproses...' : 'Generate RPM'}
      </button>
    </form>
  );
};

// === DARI App.tsx ===
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
        setError(`Gagal menghasilkan RPM: ${e.message}`);
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
            {error && <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>}
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

// === LOGIKA RENDER DARI index.tsx (original) ===
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
