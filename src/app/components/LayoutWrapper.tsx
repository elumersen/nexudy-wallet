"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Hide sidebar on auth pages
  const isAuthPage = pathname === "/signin" || pathname === "/signup";

  if (isAuthPage) {
    // Auth pages: no sidebar, full width
    return <main className="min-h-screen">{children}</main>;
  }

  // App pages: show sidebar with margin
  return (
    <>
      <Sidebar />
      <main className="min-h-screen lg:ml-72 transition-all duration-300">
        {children}
      </main>
    </>
  );
}

