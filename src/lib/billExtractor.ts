import { GoogleGenAI } from '@google/genai';

const billSchema = {
    type: 'OBJECT',
    properties: {
        bill_type: {
            type: 'STRING',
            enum: ['Electricity', 'Gas', 'Water'],
        },
        billing_month: { type: 'STRING' },
        due_date: { 
            type: 'STRING',
            description: 'The due date of the bill formatted strictly as YYYY-MM-DD (e.g. 2026-05-19).'
        },
        amount_due: { type: 'NUMBER' },
        customer_number: { type: 'STRING' },
    },
    required: ['bill_type', 'amount_due', 'due_date', 'customer_number'],
};

export async function extractBillDetails(blobUrl: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        fileData: {
                            fileUri: blobUrl,
                            mimeType: 'application/pdf',
                        },
                    },
                    { text: 'Extract details matching the schema. Return the due_date strictly formatted as YYYY-MM-DD. customer_number can be either Customer Number, Account Number, or Consumer ID; extract the value that only has digits. Ignore any digits wrapped in parentheses (e.g. 123(4) is extracted as 123).' },
                ],
            },
        ],
        config: {
            responseMimeType: 'application/json',
            responseSchema: billSchema,
        },
    });

    return JSON.parse(response.text || '{}');
}
