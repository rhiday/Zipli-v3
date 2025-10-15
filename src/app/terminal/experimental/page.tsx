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
            <div className="w-full h-screen">
                <MapView className="w-full h-full" />
            </div>
        </TerminalUIShell>
    );
}
