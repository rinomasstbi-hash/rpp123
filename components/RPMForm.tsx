
import React, { useState, useEffect, useCallback } from 'react';
import type { RPMInput, PedagogicalPractice, GraduateDimension } from '../types.ts';
import { PEDAGOGICAL_PRACTICES, GRADUATE_DIMENSIONS } from '../constants.ts';

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


export const RPMForm: React.FC<RPMFormProps> = ({ onSubmit, isLoading }) => {
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