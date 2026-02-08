"use client";
import { Bell, Menu, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import UserMenu from "./use-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LoginNotification from "@/components/dashboard/LoginNotification";
import { useGetAllContacts } from "@/hooks/useContact";

interface NavbarProps {
  pathname: string;
  unreadCount: number;
  isLogingOut: boolean;
  handleLogout: () => Promise<void>;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export default function Navbar({
  isLogingOut,
  handleLogout,
  onToggleSidebar,
}: NavbarProps) {
  const router = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("query") || ""
  );
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [shouldAutoSearch, setShouldAutoSearch] = useState(false);

  // Fetch unread contacts
  const { data: contactData } = useGetAllContacts(1, 50);
  const contacts = contactData?.data?.contacts || [];
  const unreadContacts = contacts.filter((c: any) => !c.isView);
  const displayContacts = unreadContacts.slice(0, 10);
  const unreadCount = unreadContacts.length;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Auto-search when debounced query changes (only if user is typing)
  useEffect(() => {
    if (debouncedQuery.trim() && shouldAutoSearch) {
      router(
        `/dashboard/products/search?search=${encodeURIComponent(debouncedQuery.trim())}`
      );
      setShouldAutoSearch(false); // Reset after navigation
    }
  }, [debouncedQuery]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShouldAutoSearch(true); // Enable auto-search when user types
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShouldAutoSearch(false); // Disable auto-search for manual submit
      router(
        `/dashboard/products/search?search=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  return (
    <header className="h-16 my-auto border-b z-[50] bg-background flex items-center px-6 sticky top-0 ">
      <div className="w-full max-w-screen-2xl mx-auto flex items-center justify-between relative">
        {/* Sidebar toggle (left) */}
        <div className="flex  items-center z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="bg-gray-50 hover:bg-gray-100 cursor-pointer"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>{" "}
          <form
            onSubmit={handleSearch}
            className="absolute  left-12 w-full max-w-sm"
          >
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search packages..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                className="w-full pl-5 pr-4 py-2 bg-white border border-gray-200 rounded-sm focus-visible:ring focus-visible:ring-orange-400 focus-visible:border-transparent transition-all placeholder:text-gray-400"
              />
              <Button
                type="submit"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-sm font-medium bg-transparent  focus:outline-none  h-fit w-fit py-3.5  px-4 rounded-r-sm flex flex-row justify-center items-cente gap-1"
                disabled={!searchQuery.trim()}
              >
                <Search className=" size-6 text-zinc-400 pointer-events-none" />
              </Button>
            </div>
          </form>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-6 z-10">
          <LoginNotification />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full bg-zinc-50 hover:bg-zinc-50 cursor-pointer border hover:border-orange-500"
              >
                <Bell className="h-5 w-5 text-zinc-400" />

                {unreadCount > 0 && (
                  <Badge className="absolute animate-pulse text-white -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 rounded-xl p-0" align="end">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold text-sm text-zinc-800">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="text-green-500 py-0.5 text-sm font-bold border-none hover:bg-green-500">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
                {displayContacts.length > 0 ? (
                  displayContacts.map((contact: any) => (
                    <DropdownMenuItem
                      key={contact.id}
                      className="cursor-pointer p-4 border-b last:border-0 hover:bg-zinc-50 focus:bg-zinc-50 transition-colors flex flex-col items-start gap-1 w-full"
                      onClick={() => router(`/dashboard/inbox/${contact.id}`)}
                    >
                      <div className="flex gap-3 items-start w-full">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shrink-0 text-xs shadow-sm">
                          {contact.fullname.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col overflow-hidden w-full">
                          <div className="flex justify-between items-center w-full">
                            <h3 className="text-sm font-semibold truncate pr-2 text-zinc-800">
                              {contact.fullname}
                            </h3>
                            <span className="text-[10px] text-zinc-400 shrink-0">
                              {new Date(contact.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-zinc-500 text-xs line-clamp-2 mt-0.5 leading-relaxed">
                            {contact.purpose || "New message received"}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="py-12 text-center text-zinc-500 flex flex-col items-center gap-3">
                    <div className="bg-zinc-50 p-4 rounded-full">
                      <Bell className="h-8 w-8 text-zinc-200" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-zinc-900">All caught up!</p>
                      <p className="text-xs text-zinc-400">No new messages in your inbox.</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 border-t bg-zinc-50/50">
                <DropdownMenuItem asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs border-zinc-200 text-zinc-600 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 font-medium cursor-pointer transition-all duration-200 shadow-sm"
                    onClick={() => router("/dashboard/inbox")}
                  >
                    View All Messages
                  </Button>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <UserMenu isLogingOut={isLogingOut} handleLogout={handleLogout} />
        </div>
      </div>
    </header>
  );
}
