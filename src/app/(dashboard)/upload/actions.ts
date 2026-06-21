'use server'

import { createClient } from "@/lib/server"
import { GoogleGenAI } from "@google/genai";
import { del } from '@vercel/blob';

const isDev = process.env.NODE_ENV === 'development';

const billSchema = {
    type: "OBJECT",
    properties: {
        bill_type: {
            type: "STRING",
            enum: ["Electricity", "Gas", "Water"]
        },
        billing_month: { type: "STRING" },
        amount_due: { type: "NUMBER" },
        due_date: { type: "STRING" },
    },
    required: ["bill_type", "amount_due", "due_date"]
};

export async function processBillFile(blobUrl: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
        // Extract data using schema...
        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            fileData: {
                                fileUri: blobUrl,
                                mimeType: "application/pdf",
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
        //await del(blobUrl).catch(() => { });
    }
}

