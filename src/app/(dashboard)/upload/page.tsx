import { createClient } from '@/lib/server'
import { UploadArea } from './UploadArea'

export default async function UploadPage() {
    const supabase = await createClient()

    console.time("Supabase Fetch")
    const { data: tenants } = await supabase
        .from('tenants')
        .select('id, name, properties(name)')
        .eq('is_active', true)
        .order('name', { ascending: true })
    console.timeEnd("Supabase Fetch")

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Upload Bill</h2>
                <p className="text-slate-500 mt-2">Upload a digital PDF bill to automatically extract details.</p>
            </div>

            <UploadArea tenants={tenants || []} />
        </div>
    )
}
