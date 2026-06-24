import { createClient } from '@/lib/server'
import { TenantModals } from './TenantModals'
import { Home } from 'lucide-react'

export default async function TenantsPage() {
    const supabase = await createClient()

    const { data: properties } = await supabase
        .from('properties')
        .select('*, tenants(*)')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tenants & Properties</h2>
                <p className="text-slate-500 mt-2">Manage your rental units and tenant details.</p>
            </div>

            <TenantModals properties={properties || []} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {properties?.length === 0 ? (
                    <div className="col-span-full p-8 text-center bg-white border border-slate-200 rounded-xl">
                        <Home className="mx-auto h-12 w-12 text-slate-300" />
                        <h3 className="mt-2 text-sm font-semibold text-slate-900">No properties</h3>
                        <p className="mt-1 text-sm text-slate-500">Get started by creating a new property.</p>
                    </div>
                ) : (
                    properties?.map(property => (
                        <div key={property.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{property.name}</h3>
                                    <p className="text-sm text-slate-500">{property.address || 'No address provided'}</p>
                                </div>
                            </div>
                            <div className="p-0">
                                {property.tenants.length === 0 ? (
                                    <div className="p-6 text-sm text-slate-500 text-center">No tenants assigned.</div>
                                ) : (
                                    <ul className="divide-y divide-slate-100">
                                        {property.tenants.map((tenant: any) => (
                                            <li key={tenant.id} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                                <div>
                                                    <p className="font-medium text-slate-900">{tenant.name}</p>
                                                    <p className="text-sm text-slate-500">{tenant.phone_number}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-slate-900">${Number(tenant.rent_amount).toFixed(2)}</p>
                                                    <p className="text-xs text-slate-500">Due day: {tenant.due_date_day}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
