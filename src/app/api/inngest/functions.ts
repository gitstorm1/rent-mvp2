import { inngest } from '@/lib/innjest';
import { extractBillDetails } from '@/app/(dashboard)/upload/billExtractor';
import { del } from '@vercel/blob';
import { createClient } from '@/lib/server';

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
        /*await step.run('save-bill-to-db', async () => {
            const supabase = await createClient();
            const { error } = await supabase
                      .from("bills") // Ensure your schema has a matching table
                      .insert({
                          user_id: userId,
                          bill_type: billData.bill_type,
                          billing_month: billData.billing_month,
                          amount_due: billData.amount_due,
                          due_date: billData.due_date,
                          status: "processed",
                      });
      
                  if (error) throw new Error(`Database error: ${error.message}`);
        });*/

        // Step 3: Clean up the file from Vercel Blob
        /*await step.run('delete-uploaded-blob', async () => {
            await del(blobUrl, {
                token: process.env.BLOB_READ_WRITE_TOKEN,
            });
        });*/

        return { success: true, billData };
    },
);
