// src/components/ui/SummaryCard.tsx
"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface SummaryCardProps {
  summary: string;
  translated: string;
  title?: string;
  urduTitle?: string;
  cached?: boolean;
}

export default function SummaryCard({ 
  summary, 
  translated, 
  title, 
  urduTitle, 
  cached 
}: SummaryCardProps) {
  const [activeTab, setActiveTab] = useState<"english" | "urdu">("english");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={`space-y-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Enhanced Language Selection */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
          <button
            onClick={() => setActiveTab("english")}
            className={`tab-button ${activeTab === "english" ? "active" : ""}`}
          >
            <span>🇬🇧 English Summary</span>
          </button>
          <button
            onClick={() => setActiveTab("urdu")}
            className={`tab-button ${activeTab === "urdu" ? "active" : ""}`}
          >
            <span>🇵🇰 اردو خلاصہ</span>
          </button>
        </div>
        
        {cached && (
          <div className="cached-indicator">
            <span>Cached Result</span>
          </div>
        )}
      </div>

      {/* Enhanced Summary Card */}
      <Card className="gradient-card-bg shadow-2xl border-0 overflow-hidden">
        <CardHeader className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-2xl font-bold text-white">
              {activeTab === "english" ? (title || "Summary") : (urduTitle || "خلاصہ")}
            </CardTitle>
            
            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(activeTab === "english" ? summary : translated)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white/80 hover:text-white transition-all duration-200 text-sm font-medium"
                title="Copy to clipboard"
              >
                📋 Copy
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white/80 hover:text-white transition-all duration-200 text-sm font-medium"
                title="Print summary"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Summary Content */}
          <div className="relative">
            <div className={`transition-all duration-500 ${activeTab === "english" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 absolute inset-0"}`}>
              {activeTab === "english" && (
                <div className="prose prose-invert max-w-none">
                  <p className="text-white/90 leading-relaxed text-lg">
                    {summary}
                  </p>
                </div>
              )}
            </div>
            
            <div className={`transition-all duration-500 ${activeTab === "urdu" ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 absolute inset-0"}`}>
              {activeTab === "urdu" && (
                <div className="prose prose-invert max-w-none" dir="rtl">
                  <p className="text-white/90 leading-relaxed text-lg font-urdu">
                    {translated}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Stats/Info Bar */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <span>📊</span>
              <span>Words: {activeTab === "english" ? summary.split(' ').length : translated.split(' ').length}</span>
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <span>⏱️</span>
              <span>Read time: ~{Math.ceil((activeTab === "english" ? summary.split(' ').length : translated.split(' ').length) / 200)} min</span>
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <span>🌐</span>
              <span>Language: {activeTab === "english" ? "English" : "اردو"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}