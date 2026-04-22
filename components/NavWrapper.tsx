"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavWrapper() {
  const pathname = usePathname();
  if (pathname === "/loading") return null;
  return <Navbar />;
}
