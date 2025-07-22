"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
   Database,
   FileText,
   FolderOpen,
   Home,
   LogOut,
   Menu,
   User,
   Users,
   X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navigation() {
   const { user, loading, signOut } = useAuth();
   const pathname = usePathname();
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

   if (loading) {
      return (
         <>
            {/* Mobile header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border z-50">
               <div className="flex items-center justify-between h-full px-4">
                  <h1 className="text-xl font-semibold text-sidebar-foreground">
                     ProjectAI
                  </h1>
                  <div className="text-sm text-sidebar-foreground/60">Loading...</div>
               </div>
            </header>
            
            {/* Desktop sidebar */}
            <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border">
               <div className="flex flex-col h-full">
                  <div className="p-6">
                     <h1 className="text-xl font-semibold text-sidebar-foreground">
                        ProjectAI
                     </h1>
                  </div>
                  <div className="flex-1 px-4">
                     <div className="text-sm text-sidebar-foreground/60">Loading...</div>
                  </div>
               </div>
            </aside>
         </>
      );
   }

   const navigation = [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "Staffers", href: "/staffers", icon: Users },
      { name: "Quotes", href: "/quotes", icon: FileText },
      { name: "Projects", href: "/projects", icon: FolderOpen },
      { name: "Database", href: "/db", icon: Database },
   ];

   const isActiveLink = (href: string) => {
      if (href === "/dashboard" && pathname === "/") return true;
      return pathname.startsWith(href);
   };

   const NavItems = () => (
      <ul className="space-y-2">
         {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveLink(item.href);
            
            return (
               <li key={item.name}>
                  <Link
                     href={item.href}
                     onClick={() => setIsMobileMenuOpen(false)}
                     className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                           ? "bg-sidebar-accent text-sidebar-accent-foreground"
                           : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                     }`}
                  >
                     <Icon className="w-5 h-5" />
                     {item.name}
                  </Link>
               </li>
            );
         })}
      </ul>
   );

   const UserSection = () => (
      <div className="p-4 border-t border-sidebar-border">
         {user ? (
            <div className="space-y-3">
               <div className="flex items-center gap-3 px-3 py-2">
                  <User className="w-5 h-5 text-sidebar-foreground/70" />
                  <span className="text-sm text-sidebar-foreground/70 truncate">
                     {user.email}
                  </span>
               </div>
               <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={signOut}
                  className="w-full justify-start gap-2 h-9"
               >
                  <LogOut className="w-4 h-4" />
                  Sign Out
               </Button>
            </div>
         ) : (
            <div className="space-y-2">
               <Link href="/signin" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                     Sign In
                  </Button>
               </Link>
               <Link href="/signup" className="block">
                  <Button size="sm" className="w-full">
                     Sign Up
                  </Button>
               </Link>
            </div>
         )}
      </div>
   );

   return (
      <>
         {/* Mobile Header */}
         <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border z-50">
            <div className="flex items-center justify-between h-full px-4">
               <Link
                  href="/"
                  className="text-xl font-semibold text-sidebar-foreground hover:text-sidebar-primary transition-colors"
               >
                  ProjectAI
               </Link>
               {user && (
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                     className="w-9 h-9 p-0"
                  >
                     {isMobileMenuOpen ? (
                        <X className="w-5 h-5" />
                     ) : (
                        <Menu className="w-5 h-5" />
                     )}
                  </Button>
               )}
            </div>
         </header>

         {/* Mobile Menu Overlay */}
         {isMobileMenuOpen && (
            <div 
               className="lg:hidden fixed inset-0 z-40 bg-black/50"
               onClick={() => setIsMobileMenuOpen(false)}
            />
         )}

         {/* Mobile Menu */}
         <aside className={`lg:hidden fixed top-16 left-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-200 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
         }`}>
            <div className="flex flex-col h-full">
               {user && (
                  <nav className="flex-1 px-4 py-6">
                     <NavItems />
                  </nav>
               )}
               <UserSection />
            </div>
         </aside>

         {/* Desktop Sidebar */}
         <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border">
            <div className="flex flex-col h-full">
               {/* Header */}
               <div className="p-6 border-b border-sidebar-border">
                  <Link
                     href="/"
                     className="text-xl font-semibold text-sidebar-foreground hover:text-sidebar-primary transition-colors"
                  >
                     ProjectAI
                  </Link>
               </div>

               {/* Navigation */}
               {user && (
                  <nav className="flex-1 px-4 py-6">
                     <NavItems />
                  </nav>
               )}

               <UserSection />
            </div>
         </aside>
      </>
   );
}
