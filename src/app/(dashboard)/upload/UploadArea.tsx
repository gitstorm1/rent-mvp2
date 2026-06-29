'use client';

import { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';
import { upload } from '@vercel/blob/client';
import { processBillFile } from './actions';

export function UploadArea() {
    const [uploadingCount, setUploadingCount] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    const handleUploadFiles = async (selectedFiles: File[]) => {
        const validFiles = selectedFiles.filter((file) => {
            if (file.size > MAX_FILE_SIZE) {
                alert(`File "${file.name}" exceeds the 5 MB limit.`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setUploadingCount(validFiles.length);

        const uploadPromises = validFiles.map(async (file) => {
            try {
                const uniqueFilename = `${crypto.randomUUID()}-${file.name}`;

                const blob = await upload(uniqueFilename, file, {
                    access: 'public',
                    handleUploadUrl: '/api/v1/bill/upload',
                });

                const result = await processBillFile(blob.url);

                if (result.success) {
                    console.log(`Uploaded successfully ${result.message}`);
                } else {
                    alert(`Error processing ${file.name}: ${result.error}`);
                }
            } catch (error: unknown) {
                const errorMessage =
                    error instanceof Error ? error.message : 'An unknown error occurred';
                alert(`Upload failed for ${file.name}: ${errorMessage}`);
            } finally {
                setUploadingCount((prev) => Math.max(0, prev - 1));
            }
        });

        await Promise.all(uploadPromises);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            e.target.value = '';
            await handleUploadFiles(selectedFiles);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const selectedFiles = Array.from(e.dataTransfer.files);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            await handleUploadFiles(selectedFiles);
        }
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
                    multiple
                    onChange={handleFileChange}
                />

                {uploadingCount > 0 ? (
                    <div className="animate-pulse flex flex-col items-center">
                        <UploadCloud className="h-12 w-12 text-blue-500 mb-4" />
                        <p className="text-slate-600 font-medium">
                            Uploading and parsing {uploadingCount} PDF
                            {uploadingCount > 1 ? 's' : ''}...
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <UploadCloud className="h-12 w-12 text-slate-400 mb-4" />
                        <p className="text-slate-600 font-medium">
                            Click or drag PDF files here to upload
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
