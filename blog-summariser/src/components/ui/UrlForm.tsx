// src/components/UrlForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UrlFormProps {
  onSubmit: (url: string) => void;
  disabled?: boolean;
}

export default function UrlForm({ onSubmit, disabled }: UrlFormProps) {
  const [url, setUrl] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    onSubmit(url.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2 items-center bg-white/70 dark:bg-black/30 p-4 rounded-xl shadow-lg backdrop-blur-md">
      <div className="relative flex-1">
        <Input
          type="url"
          placeholder="Enter blog URL"
          value={url}
          onChange={(e) => setUrl(e.currentTarget.value)}
          className="modern-input"
          required
        />
      </div>
      <Button
        type="submit"
        disabled={disabled}
        className="modern-btn"
      >
        Summarise
      </Button>
    </form>
  );
}
