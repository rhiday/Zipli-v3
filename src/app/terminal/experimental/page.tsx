'use client';

import { TerminalUIShell } from '@/components/terminal/TerminalUIShell';
import MapView from '@/components/MapView';
import { useDatabase } from '@/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ExperimentalPage() {
    const router = useRouter();
    const { currentUser, isInitialized } = useDatabase();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isInitialized) {
            setLoading(false);
        }
    }, [isInitialized]);

    if (loading) {
        return (
            <div className="min-h-screen bg-cloud flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!currentUser || !['terminals', 'sodexo_admin'].includes(currentUser.role as any)) {
        router.push('/auth/login');
        return null;
    }

    return (
        <TerminalUIShell>
            <div className="w-full h-full flex gap-2 bg-[#EEEDE7] p-2">
                <div className='w-1/4 flex flex-col justify-between gap-3'>
                    <div className='bg-white rounded-sm p-3 h-1/3'>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">
                                    Linjastohävikki (kg)
                                </p>
                                <p className="text-xs text-gray-500 mb-1">
                                    01-09/2025
                                </p>
                                <p className="text-2xl font-bold text-blue-600 break-words">
                                    1134,0 kg
                                </p>
                            </div>
                            <div className="w-5 h-5 text-gray-300 mt-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className='bg-white rounded-sm p-3 flex-1'>
                        B
                    </div>
                </div>
                <div className="w-2/4 h-full relative rounded-md">
                    <MapView className='w-full h-full' />
                </div>
                <div className='w-1/4 flex flex-col justify-between gap-3'>
                    <div className='bg-white rounded-sm p-3 h-1/3'>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">
                                    Linjastohävikki (kg)
                                </p>
                                <p className="text-xs text-gray-500 mb-1">
                                    01-09/2025
                                </p>
                                <p className="text-2xl font-bold text-blue-600 break-words">
                                    1134,0 kg
                                </p>
                            </div>
                            <div className="w-5 h-5 text-gray-300 mt-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className='bg-white rounded-sm p-3 flex-1'>
                        B
                    </div>
                </div>
            </div>
        </TerminalUIShell>
    );
}
