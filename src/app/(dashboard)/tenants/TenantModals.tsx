'use client';

import { useState } from 'react';
import { addProperty, addTenant } from './actions';

export function TenantModals({ properties }: { properties: any[] }) {
    const [isPropertyModalOpen, setPropertyModalOpen] = useState(false);
    const [isTenantModalOpen, setTenantModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleAddProperty(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        await addProperty(formData);
        setLoading(false);
        setPropertyModalOpen(false);
    }

    async function handleAddTenant(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        await addTenant(formData);
        setLoading(false);
        setTenantModalOpen(false);
    }

    return (
        <>
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setPropertyModalOpen(true)}
                    className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors"
                >
                    Add Property
                </button>
                <button
                    onClick={() => setTenantModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    Add Tenant
                </button>
            </div>

            {isPropertyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm w-screen h-screen">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold mb-4 text-slate-900">
                            Add Property
                        </h3>
                        <form onSubmit={handleAddProperty} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Name
                                </label>
                                <input
                                    required
                                    name="name"
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900"
                                    placeholder="e.g. Apartment 4B"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Address
                                </label>
                                <input
                                    name="address"
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900"
                                    placeholder="Full address"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setPropertyModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:text-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Property'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isTenantModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm w-screen h-screen">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold mb-4 text-slate-900">
                            Add Tenant
                        </h3>
                        {properties.length === 0 ? (
                            <div className="text-slate-600">Please add a property first.</div>
                        ) : (
                            <form onSubmit={handleAddTenant} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        required
                                        name="name"
                                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        required
                                        name="phone_number"
                                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900"
                                        placeholder="+923001234567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Property Assignment
                                    </label>
                                    <select
                                        required
                                        name="property_id"
                                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900"
                                    >
                                        <option value="">Select a property</option>
                                        {properties.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Rent Amount
                                    </label>
                                    <input
                                        required
                                        name="rent_amount"
                                        type="number"
                                        step="0.01"
                                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900"
                                        placeholder="1000.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Monthly Due Day
                                    </label>
                                    <input
                                        required
                                        name="due_date_day"
                                        type="number"
                                        min="1"
                                        max="31"
                                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900"
                                        placeholder="5"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setTenantModalOpen(false)}
                                        className="px-4 py-2 text-slate-600 hover:text-slate-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save Tenant'}
                                    </button>
                                </div>
                            </form>
                        )}
                        {properties.length === 0 && (
                            <div className="flex justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => setTenantModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:text-slate-800"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
