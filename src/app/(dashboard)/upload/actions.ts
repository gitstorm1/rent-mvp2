'use server'

import { PDFParse } from 'pdf-parse'

const isDev = process.env.NODE_ENV === 'development';

export async function processBillFile(formData: FormData) {
    console.log("processBillFile executed!")

    const file = formData.get('file') as File | null
    if (!file) {
        if (isDev) {
            console.error("No file found in formData")
        }
        return { success: false, error: "No file uploaded" }
    }

    try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const parser = new PDFParse({ data: buffer })
        const data = await parser.getText()

        console.log("--- Extracted PDF Text ---")
        console.log(data.text)
        console.log("--------------------------")

        return {
            success: true,
            text: data.text
        }
    } catch (error: any) {
        if (isDev) {
            console.error("Failed to parse PDF:", error)
        }
        return {
            success: false,
            error: error.message || "Failed to parse PDF"
        }
    }
}
