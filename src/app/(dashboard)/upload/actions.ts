'use server'

import { GoogleGenAI } from "@google/genai";
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { del } from '@vercel/blob';

const isDev = process.env.NODE_ENV === 'development';

const billSchema = {
    type: "OBJECT",
    properties: {
        bill_type: {
            type: "STRING",
            enum: ["Electricity", "Gas", "Water"]
        },
        billing_month: { type: "STRING" }, // e.g. "June 2026"
        amount_due: { type: "NUMBER" },
        due_date: { type: "STRING" },      // e.g. "YYYY-MM-DD"
    },
    required: ["bill_type", "amount_due", "due_date"]
};

export async function processBillFile(blobUrl: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    let tempFilePath = "";
    let uploadResult: any = null;
    try {
        // 1. Fetch the file from Vercel Blob URL on the server
        console.log("Fetching file from Blob URL");
        console.log("Blob URL:", blobUrl);
        const fileResponse = await fetch(blobUrl, {
            headers: {
                Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
            },
        });
        if (!fileResponse.ok) {
            throw new Error(`Failed to download PDF from storage. ${fileResponse.status} ${fileResponse.statusText}`);
        }

        const arrayBuffer = await fileResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        // 2. Save locally to server temp folder
        tempFilePath = path.join(os.tmpdir(), `${Date.now()}_bill.pdf`);
        await fs.writeFile(tempFilePath, buffer);
        // 3. Upload to Gemini Files API (handles large sizes & OCR automatically)
        uploadResult = await ai.files.upload({
            file: tempFilePath,
            config: {
                mimeType: "application/pdf",
                displayName: "bill.pdf"
            }
        });
        // 4. Extract data using schema...
        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            fileData: {
                                fileUri: uploadResult.uri,
                                mimeType: uploadResult.mimeType
                            }
                        },
                        { text: "Extract details matching the schema." }
                    ]
                }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: billSchema,
            }
        });
        return { success: true, data: JSON.parse(response.text || "{}") };
    } catch (error: any) {
        return { success: false, error: error.message };
    } finally {
        // Cleanup temp file and Gemini upload space
        if (tempFilePath) await fs.unlink(tempFilePath).catch(() => { });
        if (uploadResult) await ai.files.delete({ name: uploadResult.name }).catch(() => { });
        //await del(blobUrl).catch(() => { });
    }
}

