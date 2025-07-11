// src/app/page.tsx
"use client";

import { useState } from "react";
import UrlForm from "@/components/ui/UrlForm";
import SummaryCard from "@/components/ui/SummaryCard";

interface SummariseResponse {
  summary: string;
  translated: string;
  title?: string;
  urduTitle?: string;
  cached?: boolean;
}

export default function HomePage() {
  const [result, setResult] = useState<SummariseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(url: string) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      
      // Check if this was a cached result
      const isCached = data.dbStatus?.supabase?.cached || false;
      
      setResult({ 
        summary: data.summary, 
        translated: data.translated,
        title: data.title,
        urduTitle: data.urduTitle,
        cached: isCached
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center">Blog Summariser</h1>

      <UrlForm onSubmit={handleSubmit} disabled={loading} />

      {loading && <p className="text-center">Loading…</p>}
      {error && <p className="text-red-600 text-center">{error}</p>}
      {result && <SummaryCard 
        summary={result.summary} 
        translated={result.translated}
        title={result.title}
        urduTitle={result.urduTitle}
        cached={result.cached}
      />}
    </div>
  );
}