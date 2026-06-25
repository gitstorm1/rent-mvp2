import { createClient } from '@/lib/server'
import { LedgerClient } from './LedgerClient'

export default async function LedgerPage(props: { searchParams: Promise<{ status?: string, month?: string }> }) {
    const searchParams = await props.searchParams;
    const supabase = await createClient()

    let query = supabase
        .from('bills')
        .select(`
      *,
      payments(amount_paid),
      tenants(name, phone_number, properties(name))
    `)
        .order('due_date', { ascending: false })

    if (searchParams.status && searchParams.status !== 'all') {
        query = query.eq('status', searchParams.status)
    }
    if (searchParams.month && searchParams.month !== 'all') {
        query = query.eq('billing_month', searchParams.month)
    }

    const { data: bills } = await query

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Ledger</h2>
                <p className="text-slate-500 mt-2">Track all bills and payments across your properties.</p>
            </div>

            <LedgerClient bills={bills || []} />
        </div>
    )
}
