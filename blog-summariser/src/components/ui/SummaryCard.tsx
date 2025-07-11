// src/components/ui/SummaryCard.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon } from "lucide-react";

interface SummaryCardProps {
  summary: string;
  translated: string;
  title?: string;
  urduTitle?: string;
  cached?: boolean;
}

export default function SummaryCard({ summary, translated, title, urduTitle, cached }: SummaryCardProps) {
  const [activeTab, setActiveTab] = useState<"english" | "urdu">("english");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Check for system preference on initial load
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Theme toggle and language selection buttons */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant={activeTab === "english" ? "default" : "outline"}
            onClick={() => setActiveTab("english")}
          >
            English Summary
          </Button>
          <Button
            variant={activeTab === "urdu" ? "default" : "outline"}
            onClick={() => setActiveTab("urdu")}
          >
            اردو خلاصہ
          </Button>
        </div>
        
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </Button>
      </div>

      {/* Summary card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{activeTab === "english" ? (title || "Summary") : (urduTitle || "خلاصہ")}</CardTitle>
            {cached && <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">Cached result</span>}
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === "english" ? (
            <div>
              <p>{summary}</p>
            </div>
          ) : (
            <div dir="rtl" className="text-right">
              <p>{translated}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}