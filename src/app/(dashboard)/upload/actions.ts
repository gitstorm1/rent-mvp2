'use server';

import { del } from '@vercel/blob';
import { createClient } from '@/lib/server';
import { extractBillDetails } from './billExtractor';
import { inngest } from '@/lib/innjest';
import { validateBlobUrl } from '@/lib/blob-validator';

export async function processBillFile(blobUrl: string) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        // --- SECURITY VALIDATION ---
        const isValid = await validateBlobUrl(blobUrl);
        if (!isValid) {
            return { success: false, error: 'Invalid file source detected.' };
        }

        // Trigger Inngest background event
        await inngest.send({
            name: 'bill/uploaded',
            data: {
                blobUrl,
                userId: user.id,
            },
        });

        // Instantly return to the client
        return { success: true, message: 'Processing started in background.' };

        /*const data = await extractBillDetails(blobUrl);
            return { success: true, data };*/
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, error: errorMessage };
    } /*finally {
        await del(
            blobUrl,
            {
                token: process.env.BLOB_READ_WRITE_TOKEN,
            }
        ).catch((err: unknown) => {
            console.error('Failed to delete blob from Vercel Blob storage:', err);
        });
    }*/
}
