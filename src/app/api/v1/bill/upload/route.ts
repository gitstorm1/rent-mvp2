import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname) => {
                // Authenticate the user here (e.g., check cookie or session)
                // If unauthorized, throw an error.

                return {
                    allowedContentTypes: ['application/pdf'],
                    tokenPayload: JSON.stringify({
                        // Optional metadata to associate with the upload
                    }),
                };
            },
            /*onUploadCompleted: async ({ blob, tokenPayload }) => {
                // Triggered after the upload is successfully finished
                console.log('Upload completed:', blob.url);
            },*/
        });

        return NextResponse.json(jsonResponse);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}