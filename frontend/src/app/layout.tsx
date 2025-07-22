import { Navigation } from "@/components/layout/Navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { EventStreamProvider } from "@/contexts/EventStreamContext";
import { EventSidebar } from "@/components/layout/EventSidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
   title: "PSA Agent - Professional Service Automation",
   description: "Intelligent automation for professional services"
};

export default function RootLayout({
   children
}: {
   children: React.ReactNode;
}) {
   return (
      <html lang="en">
         <body className={inter.className}>
            <AuthProvider>
               <EventStreamProvider>
                  <Navigation />
                  <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen bg-background">
                     {children}
                  </main>
                  <EventSidebar />
               </EventStreamProvider>
            </AuthProvider>
         </body>
      </html>
   );
}
