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
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <Input
        type="url"
        placeholder="Enter blog URL"
        value={url}
        onChange={(e) => setUrl(e.currentTarget.value)}
        className="flex-1"
        required
      />
      <Button type="submit" disabled={disabled}>
        Summarise
      </Button>
    </form>
  );
}
