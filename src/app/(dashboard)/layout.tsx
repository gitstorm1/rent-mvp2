import Link from 'next/link';
import { Home, Users, Upload, LogOut } from 'lucide-react';

export default async function DashboardLayout({
    children,
}: {
  children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b border-slate-200">
                    <h1 className="text-xl font-bold text-slate-800">Rent MVP</h1>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    <Link
                        href="/dashboard"
                        className="flex items-center px-3 py-2 text-slate-700 rounded-md hover:bg-slate-100 group"
                    >
                        <Home className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-500" />
            Dashboard
                    </Link>
                    <Link
                        href="/tenants"
                        className="flex items-center px-3 py-2 text-slate-700 rounded-md hover:bg-slate-100 group"
                    >
                        <Users className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-500" />
            Tenants
                    </Link>
                    <Link
                        href="/upload"
                        className="flex items-center px-3 py-2 text-slate-700 rounded-md hover:bg-slate-100 group"
                    >
                        <Upload className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-500" />
            Upload Bill
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-200">
                    <form action="/auth/signout" method="post">
                        <button
                            type="submit"
                            className="flex w-full items-center px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-100 group"
                        >
                            <LogOut className="mr-3 h-4 w-4 text-slate-400 group-hover:text-slate-500" />
              Sign out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
