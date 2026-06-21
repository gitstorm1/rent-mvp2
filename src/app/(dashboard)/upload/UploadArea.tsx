'use client'

import { useState, useRef } from 'react'
//import { processBillFile, confirmAndSaveBill } from './actions'
import { UploadCloud, FileText, CheckCircle } from 'lucide-react'
import { processBillFile } from './actions'
import { upload } from '@vercel/blob/client';

export function UploadArea({ tenants }: { tenants: any[] }) {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [extracted, setExtracted] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)
            await handleUpload(selectedFile)
        }
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const selectedFile = e.dataTransfer.files[0]
            setFile(selectedFile)
            await handleUpload(selectedFile)
        }
    }

    const handleUpload = async (selectedFile: File) => {
        setUploading(true);
        console.log("START UPLOAD");
        // 1. Upload file directly from the browser to Vercel Blob
        const uniqueFilename = `${crypto.randomUUID()}-${selectedFile.name}`;

        const blob = await upload(uniqueFilename, selectedFile, {
            access: 'public',
            handleUploadUrl: '/api/v1/bill/upload', // Handshake endpoint for security token
        });

        console.log("END UPLOAD");
        // 2. The browser receives the direct public URL (e.g., https://xxx.public.blob.vercel-storage.com/bill.pdf)
        console.log("Blob URL:", blob.url);
        // 3. Send ONLY the URL to your Server Action to extract the bill
        const result = await processBillFile(blob.url);

        if (result.success) {
            /*setExtracted({
                ...result.data,
                pdf_url: blob.url
            });*/
            console.log("Extraction result:", result);
        } else {
            alert(result.error);
        }

        setUploading(false);
    };

    /*const handleUpload = async (selectedFile: File) => {
        console.log("File upload requested")
        setUploading(true)
        setExtracted(null)
        setSuccess(false)

        const formData = new FormData()
        formData.append('file', selectedFile)

        await processBillFile(formData);

        const result = await processBillFile(formData)
        
        if (result.success) {
          setExtracted({
            ...result.extractedData,
            pdf_url: result.pdf_url
          })
        } else {
          alert(result.error)
        }

        setUploading(false)
    }*/

    const handleSave = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSaving(true)

        const formData = new FormData(e.currentTarget)
        formData.append('pdf_url', extracted.pdf_url)

        /*const result = await confirmAndSaveBill(formData)
        
        if (result.success) {
          setSuccess(true)
          setFile(null)
          setExtracted(null)
        } else {
          alert(result.error)
        }*/

        setSaving(false)
    }

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
                        <p className="text-slate-600 font-medium">Uploading and parsing PDF...</p>
                    </div>
                ) : file && !success ? (
                    <div className="flex flex-col items-center">
                        <FileText className="h-12 w-12 text-blue-500 mb-4" />
                        <p className="text-slate-900 font-medium">{file.name}</p>
                        <p className="text-sm text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                ) : success ? (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                        <p className="text-green-700 font-medium">Bill saved successfully!</p>
                        <p className="text-sm text-slate-500 mt-1">Click to upload another</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <UploadCloud className="h-12 w-12 text-slate-400 mb-4" />
                        <p className="text-slate-600 font-medium">Click or drag PDF here to upload</p>
                        <p className="text-sm text-slate-500 mt-1">Automatically extracts amount and due date</p>
                    </div>
                )}
            </div>

            {/* Confirmation Form */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Review & Confirm</h3>

                {extracted ? (
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tenant</label>
                            <select required name="tenant_id" className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900">
                                <option value="">Select Tenant</option>
                                {tenants.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.properties?.name})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Bill Type</label>
                            <select required name="bill_type" defaultValue={extracted.bill_type} className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900">
                                <option value="Rent">Rent</option>
                                <option value="Electricity">Electricity</option>
                                <option value="Gas">Gas</option>
                                <option value="Water">Water</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Billing Month</label>
                            <input required name="billing_month" defaultValue={new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' })} className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Amount Due</label>
                                <input required name="amount_due" type="number" step="0.01" defaultValue={extracted.amount_due} className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                                <input required name="due_date" type="date" defaultValue={extracted.due_date} className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900" />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100 mt-6">
                            <button type="submit" disabled={saving} className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50">
                                {saving ? 'Saving...' : 'Confirm and Save to Ledger'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="flex items-center justify-center h-48 text-slate-400 bg-slate-50 border border-slate-100 border-dashed rounded-lg">
                        Upload a bill to see extracted details
                    </div>
                )}
            </div>
        </div>
    )
}
