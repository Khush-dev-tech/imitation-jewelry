"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

/** Search box — App Flow Screen 4: "Query text (editable)," URL-reflected for shareability. */
export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = value.trim();
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2" role="search">
      <div className="flex-1">
        <Input
          type="search"
          label="Search"
          placeholder="Search for necklaces, earrings, bangles..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <Button type="submit" variant="primary" aria-label="Search">
        <SearchIcon aria-hidden="true" className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
      </Button>
    </form>
  );
}
