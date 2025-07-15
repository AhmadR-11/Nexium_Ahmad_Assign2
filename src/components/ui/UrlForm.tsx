// src/components/ui/UrlForm.tsx
"use client";
import { useState, FormEvent, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UrlFormProps {
  onSubmit: (url: string) => void;
  disabled?: boolean;
}

export default function UrlForm({ onSubmit, disabled }: UrlFormProps) {
  const [url, setUrl] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [recentUrls, setRecentUrls] = useState<string[]>([]);

  useEffect(() => {
    // Load recent URLs from localStorage (if available)
    try {
      const saved = localStorage.getItem('recentUrls');
      if (saved) {
        setRecentUrls(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load recent URLs:', error);
    }
  }, []);

  useEffect(() => {
    // Validate URL
    try {
      if (url.trim()) {
        new URL(url);
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    } catch {
      setIsValid(false);
    }
  }, [url]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!url.trim() || !isValid) return;
    
    const trimmedUrl = url.trim();
    onSubmit(trimmedUrl);
    
    // Add to recent URLs
    const newRecentUrls = [trimmedUrl, ...recentUrls.filter(u => u !== trimmedUrl)].slice(0, 5);
    setRecentUrls(newRecentUrls);
    
    try {
      localStorage.setItem('recentUrls', JSON.stringify(newRecentUrls));
    } catch (error) {
      console.error('Failed to save recent URLs:', error);
    }
  }

  function handleRecentUrlClick(recentUrl: string) {
    setUrl(recentUrl);
    onSubmit(recentUrl);
  }

  function clearRecentUrls() {
    setRecentUrls([]);
    try {
      localStorage.removeItem('recentUrls');
    } catch (error) {
      console.error('Failed to clear recent URLs:', error);
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Form */}
      <form onSubmit={handleSubmit} className="form-container">
        <div className="space-y-4">
          <div className="relative">
            <Input
              type="url"
              placeholder="https://example.com/blog-post"
              value={url}
              onChange={(e) => setUrl(e.currentTarget.value)}
              className="modern-input pr-12"
              required
              disabled={disabled}
            />
            
            {/* URL Status Indicator */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              {url && (
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isValid ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'
                }`}></div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={disabled || !isValid}
            className="modern-btn w-full"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {disabled ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Summarise
                </>
              )}
            </span>
          </Button>
        </div>

        {/* Quick Tips */}
        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-sm">
            💡 <strong>Pro tip:</strong> Works best with Medium, Dev.to, personal blogs, and news articles
          </p>
        </div>
      </form>

      {/* Recent URLs */}
      {recentUrls.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white/80 font-medium">Recent URLs</h3>
            <button
              onClick={clearRecentUrls}
              className="text-white/50 hover:text-white/80 text-sm transition-colors"
            >
              Clear all
            </button>
          </div>
          
          <div className="space-y-2">
            {recentUrls.map((recentUrl, index) => (
              <button
                key={index}
                onClick={() => handleRecentUrlClick(recentUrl)}
                disabled={disabled}
                className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 text-white/80 hover:text-white text-sm group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-white/50 group-hover:text-white/70">🔗</span>
                  <span className="truncate flex-1">{recentUrl}</span>
                  <span className="text-white/40 group-hover:text-white/60">→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Support Info */}
      <div className="text-center space-y-2">
        <p className="text-white/50 text-sm">
          Supports popular platforms like Medium, Dev.to, personal blogs, and news sites
        </p>
      </div>
    </div>
  );
}