// src/components/ui/SummaryCard.tsx
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SummaryCardProps {
  summary: string;
  translated: string;
  title?: string;
  urduTitle?: string;
  cached?: boolean;
}

export default function SummaryCard({ summary, translated, title, urduTitle, cached }: SummaryCardProps) {
  const [activeTab, setActiveTab] = useState<"english" | "urdu">("english");

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Language selection buttons above the card */}
      <div className="flex space-x-2 justify-center">
        <Button
          variant={activeTab === "english" ? "default" : "outline"}
          onClick={() => setActiveTab("english")}
          className="w-32"
        >
          English Summary
        </Button>
        <Button
          variant={activeTab === "urdu" ? "default" : "outline"}
          onClick={() => setActiveTab("urdu")}
          className="w-32"
        >
          اردو خلاصہ
        </Button>
      </div>

      {/* Summary card */}
      <Card className="gradient-card-bg shadow-lg transition-shadow hover:shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{activeTab === "english" ? (title || "Summary") : (urduTitle || "خلاصہ")}</CardTitle>
            {cached}
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === "english" ? (
            <div>
              <p>{summary}</p>
            </div>
          ) : (
            <div>
              <p>{translated}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}