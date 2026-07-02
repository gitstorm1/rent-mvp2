import { inngest } from '@/lib/inngest';
import { extractBillDetails } from '@/lib/billExtractor';
import { createClient } from '@supabase/supabase-js';

export const processBillUpload = inngest.createFunction(
    { id: 'process-bill-upload', triggers: { event: 'bill/uploaded' } },
    async ({ event, step, logger }) => {
        const { blobUrl, userId } = event.data;

        // Step 1: Run the AI extraction model
        const billData = await step.run('extract-bill-details', async () => {
            return await extractBillDetails(blobUrl);
        });

        logger.info('Extracted bill details:', billData);

        // Step 2: Save results to the database (Supabase)



        await step.run('save-bill-to-db', async () => {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SECRET_KEY!, // Key must start with sb_secret_...
                {
                    auth: {
                        persistSession: false,      // CRITICAL: Stops step retries from bleeding state
                        autoRefreshToken: false,    // CRITICAL: Background tasks do not keep a live loop
                        detectSessionInUrl: false   // CRITICAL: Prevents accidental browser routing checks
                    }
                }
            )

            // Execute the entire lookup & upsert in 1 database call
            const { error: rpcError } = await supabase.rpc('upsert_bill_from_customer_number', {
                p_landlord_id: userId,
                p_customer_number: billData.customer_number,
                p_bill_type: billData.bill_type,
                p_billing_month: billData.billing_month,
                p_amount_due: billData.amount_due,
                p_due_date: billData.due_date,
                p_pdf_url: blobUrl
            });

            if (rpcError) {
                throw new Error(`Database error saving bill: ${rpcError.message}`);
            }
        });

        // Step 3: Clean up the file from Vercel Blob
        /*await step.run('delete-uploaded-blob', async () => {
            await del(blobUrl, {
                token: process.env.BLOB_READ_WRITE_TOKEN,
            });
        });*/

        return { success: true, billData };
    },
);
