"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

export default function HandoverConfirmPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("donations")
        .update({ status: "picked_up", updated_at: new Date().toISOString() })
        .eq("id", params.id);
      if (error) throw error;
      router.push("/donate");
    } catch (err: any) {
      setError(err.message || "Failed to confirm handover.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
        <h1 className="text-titleMd font-bold text-primary mb-3 text-center">Confirm Handover</h1>
        <p className="text-body text-primary-75 mb-4 text-center">
          Has the donation receiver arrived?
        </p>
        <div className="mb-6">
          <span className="font-semibold text-primary block text-center text-base">
            Before handing over the donation, please make sure that the temperature is <span className="text-green-700">above 60°C</span> for warm food donation or <span className="text-blue-700">under 6°C</span> for cold food donation.
          </span>
        </div>
        {error && <div className="text-negative bg-rose-100 rounded p-2 text-sm mb-4 w-full text-center">{error}</div>}
        <div className="flex gap-4 w-full mt-2">
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Confirming..." : "Confirm"}
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
} 