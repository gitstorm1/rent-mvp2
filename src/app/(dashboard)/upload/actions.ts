'use server'

import { createClient } from "@/lib/server"
import { extractBillDetails } from "./billExtractor"

export async function processBillFile(blobUrl: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const data = await extractBillDetails(blobUrl);
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    } finally {
        //await del(blobUrl).catch(() => { });
    }
}
