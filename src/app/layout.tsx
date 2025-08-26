import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";


import React from "react";
import { AppSidebar } from "~/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "~/components/ui/sidebar";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Discord Watch",
  description: "Discord Watch but it works",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} dark`}>
      <body>
        <TRPCReactProvider>
          <SidebarProvider
            style={{
              "--sidebar-width": "350px",
            } as React.CSSProperties}
          >
            <AppSidebar />
            <SidebarInset>
              <div className="flex flex-1 flex-col gap-4 p-0">
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
