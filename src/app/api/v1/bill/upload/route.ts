import { createClient } from '@/lib/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Authenticate the user here (e.g., check cookie or session)
        // If unauthorized, throw an error.
        const supabase = await createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Unauthorized');
        }

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
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
