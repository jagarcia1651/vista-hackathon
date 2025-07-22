"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export function Navigation() {
   const { user, loading, signOut } = useAuth();

   if (loading) {
      return (
         <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex justify-between h-16">
                  <div className="flex items-center">
                     <Link
                        href="/"
                        className="text-xl font-semibold text-slate-900"
                     >
                        PSA Agent
                     </Link>
                  </div>
                  <div className="flex items-center">
                     <div className="text-sm text-slate-600">Loading...</div>
                  </div>
               </div>
            </div>
         </nav>
      );
   }

   const navigation = [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Projects", href: "/projects" },
      { name: "Quotes", href: "/quotes" },
      { name: "Database", href: "/db" }
   ];

   return (
      <nav className="bg-white shadow-sm border-b">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
               <div className="flex items-center space-x-8">
                  <Link
                     href="/"
                     className="text-xl font-semibold text-slate-900"
                  >
                     PSA Agent
                  </Link>

                  {user && (
                     <div className="hidden md:flex space-x-6">
                        {navigation.map(item => (
                           <Link
                              key={item.name}
                              href={item.href}
                              className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium"
                           >
                              {item.name}
                           </Link>
                        ))}
                     </div>
                  )}
               </div>

               <div className="flex items-center space-x-4">
                  {user ? (
                     <>
                        <span className="text-sm text-slate-600">
                           {user.email}
                        </span>
                        <Button variant="outline" size="sm" onClick={signOut}>
                           Sign Out
                        </Button>
                     </>
                  ) : (
                     <div className="space-x-2">
                        <Link href="/signin">
                           <Button variant="outline" size="sm">
                              Sign In
                           </Button>
                        </Link>
                        <Link href="/signup">
                           <Button size="sm">Sign Up</Button>
                        </Link>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </nav>
   );
}
