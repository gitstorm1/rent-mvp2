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

            // 1. Find the property matching this customer number and bill type
            const { data: mapping, error: mappingError } = await supabase
                .from('property_customer_numbers')
                .select('property_id')
                .eq('landlord_id', userId)
                .eq('customer_number', billData.customer_number)
                .eq('bill_type', billData.bill_type)
                .maybeSingle();
            if (mappingError) {
                throw new Error(`Database error finding property: ${mappingError.message}`);
            }
            if (!mapping) {
                throw new Error(`No property found with customer number ${billData.customer_number} for ${billData.bill_type}`);
            }
            // 2. Find the active tenant at that property
            const { data: tenant, error: tenantError } = await supabase
                .from('tenants')
                .select('id')
                .eq('landlord_id', userId)
                .eq('property_id', mapping.property_id)
                .eq('is_active', true)
                .maybeSingle();
            if (tenantError) {
                throw new Error(`Database error finding active tenant: ${tenantError.message}`);
            }
            if (!tenant) {
                throw new Error(`No active tenant found for property ${mapping.property_id}`);
            }
            // 3. Insert the bill record
            const { error: insertError } = await supabase
                .from('bills')
                .insert({
                    landlord_id: userId,
                    tenant_id: tenant.id,
                    bill_type: billData.bill_type,
                    billing_month: billData.billing_month,
                    amount_due: billData.amount_due,
                    due_date: billData.due_date,
                    pdf_url: blobUrl, // Assigning pdf_url here
                    status: 'unpaid',
                });
            if (insertError) {
                throw new Error(`Database error saving bill: ${insertError.message}`);
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
