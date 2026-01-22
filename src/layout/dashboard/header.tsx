"use client";

import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MobileSidebar from "./mobile-sidebar";
import UserMenu from "./use-menu";

interface HeaderProps {
  pathname: string;
  unreadCount: number;
  isLogingOut: boolean;
  handleLogout: () => Promise<void>;
}

export default function Header({
  pathname,
  unreadCount,
  isLogingOut,
  handleLogout,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard/products/search?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/70 px-4 lg:h-[60px] lg:px-6 py-4 sticky top-0 backdrop-blur-lg !z-[999999]">
      <MobileSidebar pathname={pathname} />

      <div className="w-full flex-1">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>

      <div className="relative p-4">
        <Button
          variant="outline"
          size="icon"
          className="ml-auto bg-muted/20 shadow-none border-none hover:bg-transparent"
        >
          <Bell className="h-[1.2rem] w-[1.2rem] text-zinc-500" />
          {unreadCount >= 0 && (
            <Badge className="mt-2 absolute scale-75 top-0 right-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
              5
            </Badge>
          )}
        </Button>
      </div>

      <UserMenu isLogingOut={isLogingOut} handleLogout={handleLogout} />
    </header>
  );
}
