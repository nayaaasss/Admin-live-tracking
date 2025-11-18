"use client";

import Header from "./build/components/header";
import Sidebar from "./build/components/sidebar";
import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
