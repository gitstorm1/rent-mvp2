import { createClient } from '@/lib/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

export default async function DashboardPage() {
    const supabase = await createClient();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
        { count: activeTenantsCount },
        { data: unpaidBills },
        { data: currentMonthPayments },
        { data: whoOwesWhatData },
    ] = await Promise.all([
        supabase
            .from('tenants')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true),

        supabase
            .from('bills')
            .select('amount_due, id, payments(amount_paid)')
            .in('status', ['unpaid', 'partial']),

        supabase
            .from('payments')
            .select('amount_paid')
            .gte('payment_date', startOfMonth.toISOString()),

        supabase
            .from('bills')
            .select(
                `
        id,
        amount_due,
        due_date,
        status,
        payments(amount_paid),
        tenants(name, properties(name))
      `,
            )
            .in('status', ['unpaid', 'partial'])
            .order('due_date', { ascending: true }),
    ]);

    let totalOutstanding = 0;
    unpaidBills?.forEach((bill) => {
        const paid = bill.payments.reduce(
            (acc: number, p: any) => acc + Number(p.amount_paid),
            0,
        );
        totalOutstanding += Number(bill.amount_due) - paid;
    });

    const collectedRevenue =
        currentMonthPayments?.reduce((acc, p) => acc + Number(p.amount_paid), 0) ||
        0;

    const whoOwesWhat =
        whoOwesWhatData
            ?.map((bill) => {
                const paid = bill.payments.reduce(
                    (acc: number, p: any) => acc + Number(p.amount_paid),
                    0,
                );
                const balance = Number(bill.amount_due) - paid;
                return {
                    ...bill,
                    balance,
                };
            })
            .sort((a, b) => b.balance - a.balance) || [];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Dashboard
                </h2>
                <p className="text-slate-500 mt-2">
                    Overview of your properties and collections.
                </p>
            </div>

            {/* KPI Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Total Outstanding
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            Rs. {totalOutstanding.toFixed(2)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Across all unpaid bills
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Collected This Month
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            Rs. {collectedRevenue.toFixed(2)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Payments received since {startOfMonth.toLocaleDateString()}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Active Tenants
                        </CardTitle>
                        <Users className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            {activeTenantsCount || 0}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Currently assigned to properties
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Who Owes What */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">
                        Who Owes What
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 font-medium">Tenant</th>
                                <th className="px-6 py-3 font-medium">Property</th>
                                <th className="px-6 py-3 font-medium">Due Date</th>
                                <th className="px-6 py-3 font-medium">Balance</th>
                                <th className="px-6 py-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {whoOwesWhat.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-8 text-center text-slate-500"
                                    >
                                        No outstanding balances. Great job!
                                    </td>
                                </tr>
                            ) : (
                                whoOwesWhat.map((item) => {
                                    const tenant = item.tenants as any;
                                    return (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {tenant.name}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {tenant.properties.name}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-24 inline-block">
                                                        {new Date(item.due_date).toLocaleDateString()}
                                                    </span>
                                                    {new Date(item.due_date) < new Date() && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                            Overdue
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-900">
                                                Rs. {item.balance.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <a
                                                    href={`/ledger?highlight=${item.id}`}
                                                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                                >
                                                    View details
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
