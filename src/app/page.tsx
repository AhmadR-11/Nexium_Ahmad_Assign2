// src/app/page.tsx
"use client";
import { useState, useEffect } from "react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Enhanced Header */}
        <div className="text-center space-y-4">
          <h1 className="main-title">
            Blog Summariser
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Transform any blog post into concise summaries in both English and Urdu. 
            Simply paste a URL and let AI do the magic.
          </p>
        </div>

        {/* URL Form */}
        <div className="max-w-2xl mx-auto">
          <UrlForm onSubmit={handleSubmit} disabled={loading} />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Analyzing and summarizing your blog post...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto">
            <div className="error-message">
              <strong>Oops!</strong> {error}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="max-w-4xl mx-auto">
            <SummaryCard
              summary={result.summary}
              translated={result.translated}
              title={result.title}
              urduTitle={result.urduTitle}
              cached={result.cached}
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-white/50 text-sm mt-16">
          <p>Powered by advanced AI technology</p>
        </div>
      </div>
    </div>
  );
}