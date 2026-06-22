'use client';

import { useState, useRef } from 'react';
import { UploadCloud, FileText } from 'lucide-react';
import { upload } from '@vercel/blob/client';
import { processBillFile } from './actions';

export function UploadArea() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > MAX_FILE_SIZE) {
        alert('File size exceeds the 5 MB limit.');
        return;
      }
      setFile(selectedFile);
      await handleUpload(selectedFile);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.size > MAX_FILE_SIZE) {
        alert('File size exceeds the 5 MB limit.');
        return;
      }
      setFile(selectedFile);
      await handleUpload(selectedFile);
    }
  };

  const handleUpload = async (selectedFile: File) => {
    setUploading(true);

    const uniqueFilename = `${crypto.randomUUID()}-${selectedFile.name}`;

    const blob = await upload(uniqueFilename, selectedFile, {
      access: 'public',
      handleUploadUrl: '/api/v1/bill/upload',
    });

    const result = await processBillFile(blob.url);

    if (result.success) {
      console.log('Extraction result:', result);
    } else {
      alert(result.error);
    }

    setFile(null);
    setUploading(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Upload Zone */}
      <div
        className="border-2 border-dashed border-slate-300 rounded-xl bg-white p-10 flex flex-col items-center justify-center text-center transition-colors hover:border-blue-500 hover:bg-slate-50 cursor-pointer"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="application/pdf"
          onChange={handleFileChange}
        />

        {uploading ? (
          <div className="animate-pulse flex flex-col items-center">
            <UploadCloud className="h-12 w-12 text-blue-500 mb-4" />
            <p className="text-slate-600 font-medium">
              Uploading and parsing PDF...
            </p>
          </div>
        ) : file ? (
          <div className="flex flex-col items-center">
            <FileText className="h-12 w-12 text-blue-500 mb-4" />
            <p className="text-slate-900 font-medium">{file.name}</p>
            <p className="text-sm text-slate-500 mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <UploadCloud className="h-12 w-12 text-slate-400 mb-4" />
            <p className="text-slate-600 font-medium">
              Click or drag PDF here to upload
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Automatically extracts amount and due date
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
