'use server';

import { createClient } from '@/lib/server';
import { inngest } from '@/lib/inngest';
import { validateBlobUrl } from '@/lib/blobValidator';
import { del } from '@vercel/blob';

export async function processBillFile(blobUrl: string) {
    try {
        const supabase = await createClient();

        let userId: string | undefined;

        if (process.env.NODE_ENV === 'development') {
            const { data: claimsData } = await supabase.auth.getClaims();
            userId = claimsData?.claims?.sub;
        } else {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            userId = user?.id;
        }

        const isValid = await validateBlobUrl(blobUrl);

        if (!userId) {
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
                userId,
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
