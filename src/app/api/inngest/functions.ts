import { inngest } from '@/lib/inngest';
import { extractBillDetails } from '@/lib/billExtractor';
import { createClient } from '@supabase/supabase-js';
import { del } from '@vercel/blob';

export const processBillUpload = inngest.createFunction(
    { id: 'process-bill-upload', triggers: { event: 'bill/uploaded' } },
    async ({ event, step, logger }) => {
        const { blobUrl, userId } = event.data;

        const billData = await step.run('extract-bill-details', async () => {
            const data = await extractBillDetails(blobUrl);

            logger.info('Extracted bill details:', data);

            return data
        });

        const oldPdfUrl = await step.run('save-bill-to-db', async () => {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SECRET_KEY!,
                {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false,
                        detectSessionInUrl: false
                    }
                }
            )

            // Execute the entire lookup & upsert in 1 database call
            const { data, error: rpcError } = await supabase.rpc('upsert_bill_from_customer_number', {
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

            return data;
        });

        await step.run('delete-uploaded-blob', async () => {
            await del(oldPdfUrl, {
                token: process.env.BLOB_READ_WRITE_TOKEN,
            });
        });

        return { success: true, billData };
    },
);
