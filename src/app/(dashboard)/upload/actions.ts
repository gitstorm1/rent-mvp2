'use server';

import { createClient } from '@/lib/server';
import { inngest } from '@/lib/inngest';
import { validateBlobUrl } from '@/lib/blobValidator';
import { del } from '@vercel/blob';

export async function processBillFile(blobUrl: string) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        const isValid = await validateBlobUrl(blobUrl);

        if (!user) {
            if (isValid) {
                await del(blobUrl, { token: process.env.BLOB_READ_WRITE_TOKEN });
            }
            return { success: false, error: 'Unauthorized' };
        }

        // Security Validation
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
    } catch (error: unknown) {
        try {
            await del(blobUrl, { token: process.env.BLOB_READ_WRITE_TOKEN });
        } catch (cleanupError) {
            console.error('Failed to delete blob during processBillFile failure cleanup:', cleanupError);
        }

        const errorMessage =
            error instanceof Error ? error.message : 'An unknown error occurred';

        return { success: false, error: errorMessage };
    }
}
