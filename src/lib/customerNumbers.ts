import { createClient } from './client';

export type BillType = 'Electricity' | 'Gas' | 'Water';

export type UpsertPropertyCustomerNumberArgs = {
    propertyId: string;
    billType: BillType;
    customerNumber: string;
};

/**
 * Reusable client-side function to manually add or update a property customer number
 * for a particular property and bill type.
 */
export async function upsertPropertyCustomerNumber({
    propertyId,
    billType,
    customerNumber,
}: UpsertPropertyCustomerNumberArgs) {
    // Validate bill type at runtime just in case it bypasses TS types (e.g. from standard form submissions)
    const validBillTypes: BillType[] = ['Electricity', 'Gas', 'Water'];
    if (!validBillTypes.includes(billType)) {
        throw new Error(`Invalid bill type "${billType}". Must be one of: ${validBillTypes.join(', ')}`);
    }

    if (!propertyId) {
        throw new Error('Property ID is required.');
    }

    if (!customerNumber || customerNumber.trim() === '') {
        throw new Error('Customer number cannot be empty.');
    }

    const supabase = createClient();
    
    // Get the current authenticated user to act as the landlord_id
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    
    if (userError || !user) {
        throw new Error('User not authenticated. Please log in again.');
    }

    // Use upsert to handle cases where the (property_id, bill_type) might already exist,
    // assuming there's a unique constraint on these columns for the landlord.
    const { data, error } = await supabase
        .from('property_customer_numbers')
        .upsert(
            {
                landlord_id: user.id,
                property_id: propertyId,
                bill_type: billType,
                customer_number: customerNumber,
            },
            { onConflict: 'property_id, bill_type' }
        )
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to add customer number: ${error.message}`);
    }

    return data;
}
