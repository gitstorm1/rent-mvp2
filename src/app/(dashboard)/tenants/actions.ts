'use server';

import { createClient } from '@/lib/server';
import { revalidatePath } from 'next/cache';

export async function addProperty(formData: FormData) {
    const supabase = await createClient();

    const { data: claimsData, error: authError } =
        await supabase.auth.getClaims();
    if (authError || !claimsData?.claims) return { error: 'Not authenticated' };
    const userId = claimsData.claims.sub;

    const name = formData.get('name') as string;
    const address = formData.get('address') as string;

    const { error } = await supabase.from('properties').insert({
        name,
        address,
        landlord_id: userId,
    });

    if (error) {
        console.error('Error adding property:', error);
        return { error: error.message };
    }

    revalidatePath('/tenants');
    return { success: true };
}

export async function addTenant(formData: FormData) {
    const supabase = await createClient();

    const { data: claimsData, error: authError } =
        await supabase.auth.getClaims();
    if (authError || !claimsData?.claims) return { error: 'Not authenticated' };

    const name = formData.get('name') as string;
    const phone_number = formData.get('phone_number') as string;
    const property_id = formData.get('property_id') as string;
    const rent_amount = Number(formData.get('rent_amount'));
    const due_date_day = Number(formData.get('due_date_day'));

    const { error } = await supabase.from('tenants').insert({
        name,
        phone_number,
        property_id,
        rent_amount,
        due_date_day,
    });

    if (error) {
        console.error('Error adding tenant:', error);
        return { error: error.message };
    }

    revalidatePath('/tenants');
    return { success: true };
}
