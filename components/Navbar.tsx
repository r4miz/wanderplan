"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link href="/" className="navbar__logo">Wanderplan</Link>
        <div className="navbar__links">
          <Link href="/saved" className="navbar__link">Saved Trips</Link>
          {!isHome && (
            <Link href="/" className="navbar__link navbar__cta">Plan a Trip</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
