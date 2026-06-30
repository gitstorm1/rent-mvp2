import { head } from '@vercel/blob';

export async function validateBlobUrl(url: string): Promise<boolean> {
    try {
        const parsedUrl = new URL(url);

        // 1. Ensure the URL host is actually Vercel's blob storage
        if (parsedUrl.protocol !== 'https:' || !parsedUrl.hostname.endsWith('.public.blob.vercel-storage.com')) {
            return false;
        }

        // 2. Contact Vercel Blob to verify the file exists in your account.
        // If it is an arbitrary URL, this check will fail.
        await head(url, {
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        return true;
    } catch {
        return false;
    }
}