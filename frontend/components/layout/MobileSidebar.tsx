"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-border-strong bg-white text-ink shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-72 animate-fade-up">
            <div className="relative h-full">
              <button
                onClick={() => setOpen(false)}
                className="absolute right-3 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-muted"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
              <Sidebar className="w-full" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
