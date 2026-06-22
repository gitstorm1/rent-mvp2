import { GoogleGenAI } from '@google/genai';

const billSchema = {
  type: 'OBJECT',
  properties: {
    bill_type: {
      type: 'STRING',
      enum: ['Electricity', 'Gas', 'Water'],
    },
    billing_month: { type: 'STRING' },
    amount_due: { type: 'NUMBER' },
    due_date: { type: 'STRING' },
  },
  required: ['bill_type', 'amount_due', 'due_date'],
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
          { text: 'Extract details matching the schema.' },
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
