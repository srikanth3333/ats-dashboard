"use client";

import { useUser } from "@/app/context/UserContext";
import { Badge } from "@/components/ui/badge";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import * as LucideIcons from "lucide-react"; // Import all icons from lucide-react
import {
  Bell,
  ChevronsLeft,
  ChevronsRight,
  CompassIcon,
  HelpCircle,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import DropdownMenuComponent from "./dropdown-item";

type NavItem = {
  icon: keyof typeof LucideIcons;
  label: string;
  href: string;
  hasSubmenu?: boolean;
  badge?: number;
  index?: number;
  view?: boolean;
};

interface LayoutProps {
  children: React.ReactNode;
}

const Sidebar = ({ children }: LayoutProps) => {
  const [open, setOpen] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [page, setPage] = useState<number | undefined>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { user } = useUser();
  const router = useRouter();
  const navItems: NavItem[] = user?.userProfile?.pages?.filter(
    (record: any) => record?.view !== false
  );
  const excludedPaths = ["/dashboard/settings", "/error"];
  const pathname = usePathname();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const data = [
    {
      label: "My Profile",
      icon: <User />,
      handleClick: () => router.push("/dashboard/settings"),
    },
    {
      label: "My Company",
      icon: <CompassIcon />,
      handleClick: () => router.push("/dashboard/settings"),
    },
    {
      label: "Help Center",
      icon: <HelpCircle />,
      handleClick: () => router.push("/dashboard/settings"),
    },
    {
      label: "Logout",
      icon: <LogOut className="text-red-700" />,
      handleClick: logout,
    },
  ];

  const onOpenChange = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (excludedPaths.some((path) => pathname.startsWith(path))) {
      return;
    }
    const findPage = navItems?.find(
      (record) => record?.href?.includes(pathname) && record?.view !== false
    );
    // if (!findPage) {
    //   router.push("/dashboard");
    //   setPage(0);
    //   return;
    // }
    setPage(findPage ? findPage.index : 0);
  }, [pathname, router]);

  const handleSelect = (item: any) => {
    setOpen(false);
    router.push(item);
  };

  const MyComponent = ({ icon }: { icon: keyof typeof LucideIcons }) => {
    const IconComponent = LucideIcons[icon] as React.ElementType;
    if (!IconComponent) {
      return <span>Icon not found</span>;
    }

    return (
      <div>
        <IconComponent size={24} />
      </div>
    );
  };

  const NavContent = ({ collapsed = false }) => (
    <div className="flex flex-col h-full">
      <div
        className={cn(
          "p-4 flex items-center",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2",
            collapsed && "justify-center"
          )}
        >
          <div className="bg-gray-800 p-1 rounded">
            <div className="w-5 h-5 rotate-45 bg-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold">Job Warp AI </span>
          )}
        </div>

        {/* Desktop toggle button */}
        {!collapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="hidden md:flex w-6 h-6 rounded-full hover:bg-gray-200 items-center justify-center transition-colors"
          >
            <ChevronsLeft className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 p-2">
          <TooltipProvider>
            {navItems?.map((item, index) => (
              <li key={index}>
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        onClick={() => {
                          setPage(item?.index);
                        }}
                        className={cn(
                          "flex items-center justify-center p-3 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors",
                          item?.index === page &&
                            "bg-primary-foreground text-primary"
                        )}
                      >
                        <span
                          className={cn(
                            "text-gray-500 relative",
                            item?.index === page && "text-primary"
                          )}
                        >
                          <MyComponent
                            icon={item.icon as keyof typeof LucideIcons}
                          />
                          {item.badge && (
                            <Badge className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white text-xs h-4 w-4 flex items-center justify-center rounded-full p-0">
                              {item.badge}
                            </Badge>
                          )}
                        </span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => {
                      // setIsMobileOpen(!isMobileOpen);
                      setPage(item?.index);
                    }}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors",
                      item?.index === page &&
                        "bg-primary-foreground text-primary"
                    )}
                  >
                    <div className="flex items-center gap-3 font-medium">
                      <span
                        className={cn(
                          "text-gray-500",
                          item?.index === page && "text-primary"
                        )}
                      >
                        <MyComponent
                          icon={item.icon as keyof typeof LucideIcons}
                        />
                      </span>
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full p-0">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </Link>
                )}
              </li>
            ))}
          </TooltipProvider>
        </ul>
      </nav>

      {/* <Link
        href="/dashboard/settings"
        className={cn(
          "p-4 mt-auto flex items-center cursor-pointer hover:bg-primary-foreground",
          collapsed ? "flex-col gap-2" : "gap-4"
        )}
      >
        <div className="flex gap-2 font-semibold">
          <Settings2 />
          settings
        </div>
      </Link> */}

      {/* Expand button for collapsed state */}
      {collapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="hidden md:flex mx-auto mb-4 w-6 h-6 rounded-full hover:bg-gray-200 items-center justify-center transition-colors"
        >
          <ChevronsRight className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  );

  const Header = () => (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6">
      {/* Mobile menu button */}
      <div className="md:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md w-full hidden md:block mx-4">
        <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          onFocus={() => setOpen(!open)}
          className="pl-8 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent"
        />
      </div>

      {/* Right side icons */}
      <div className="flex items-center gap-3">
        <div>
          <h5>{user?.user?.email}</h5>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>
        <Link
          href="/dashboard/settings"
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </Link>
        <DropdownMenuComponent
          data={data}
          title="Account"
          icon={
            <button
              className="p-1 rounded-full bg-gray-200"
              onClick={onOpenChange}
            >
              <User className="w-5 h-5 text-gray-700" />
            </button>
          }
        />
      </div>
    </header>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <div
        className={cn(
          "hidden md:flex flex-col h-screen bg-gray-50 border-r shadow-sm transition-all duration-300 z-20",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <NavContent collapsed={isCollapsed} />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-100">
          {children}
        </main>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {navItems?.map((record) => (
              <CommandItem onSelect={() => handleSelect(record?.href)}>
                {record?.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default Sidebar;
