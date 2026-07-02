import { GoogleGenAI } from '@google/genai';

const billSchema = {
    type: 'OBJECT',
    properties: {
        is_valid_bill: {
            type: 'BOOLEAN',
            description: 'True if the document is a valid utility bill (Electricity, Gas, or Water) AND all other fields in the schema can be determined.'
        },
        bill_type: {
            type: 'STRING',
            enum: ['Electricity', 'Gas', 'Water'],
            description: 'The type of utility bill.'
        },
        billing_month: {
            type: 'STRING',
            description: 'The billing month formatted strictly as MMM-YYYY (e.g., May-2026, Oct-2026).'
        },
        due_date: {
            type: 'STRING',
            description: 'The due date of the bill, formatted strictly as YYYY-MM-DD (e.g., 2026-05-19).'
        },
        amount_due: {
            type: 'NUMBER',
            description: 'The total amount due on the bill as a numeric value.'
        },
        customer_number: {
            type: 'STRING',
            description: 'The Customer Number, Account Number, or Consumer ID. Extract ONLY the digit characters. Ignore any digits wrapped in parentheses (e.g., if the bill says "123(4)", extract "123").'
        },
    },
    required: ['is_valid_bill'],
};

export interface ExtractedBill {
    is_valid_bill: boolean;
    bill_type?: 'Electricity' | 'Gas' | 'Water';
    billing_month?: string;
    due_date?: string;
    amount_due?: number;
    customer_number?: string;
}

export function validateExtractedBill(data: ExtractedBill) {
    if (data.is_valid_bill !== true) {
        throw new Error("The uploaded file is not recognized as a valid utility bill.");
    }

    // Validate bill_type
    if (typeof data.bill_type !== 'string' || !['Electricity', 'Gas', 'Water'].includes(data.bill_type)) {
        throw new Error("Invalid or missing bill type.");
    }

    // Validate billing_month
    if (typeof data.billing_month !== 'string' || !/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{4}$/.test(data.billing_month)) {
        throw new Error("Billing month must be in MMM-YYYY format (e.g., May-2026).");
    }

    // Validate customer_number
    if (typeof data.customer_number !== 'string' || !/^\d+$/.test(data.customer_number)) {
        throw new Error("Missing or invalid customer number (must contain only digits).");
    }

    // Validate amount_due
    if (typeof data.amount_due !== 'number' || isNaN(data.amount_due) || data.amount_due <= 0) {
        throw new Error("Amount due must be a positive number.");
    }

    // Validate due_date
    if (typeof data.due_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.due_date)) {
        throw new Error("Due date must be in YYYY-MM-DD format.");
    }
}

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
                    { text: 'Extract details matching the schema. Return NULL for fields that cannot be determined.' },
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
