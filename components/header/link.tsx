"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

// Constants for sizing
const LINK_WIDTH = 90;
const PADDING = 24;
const BACKGROUND_PADDING = 20;

// NavbarLink component
export const NavbarLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      className={`relative text-sm font-medium py-2 px-3 transition-colors duration-200 text-white w-[90px] flex items-center justify-center
        ${pathname === href ? "opacity-100" : "opacity-60 hover:opacity-80"}`}
    >
      {children}
    </Link>
  );
};

// NavbarLinkBackground component
export const NavbarLinkBackground = ({ links }: { links: string[] }) => {
  const pathname = usePathname();
  const activeIndex = links.indexOf(pathname);

  return (
    <div
      className={clsx(
        "absolute transition-all duration-200 ease-in-out h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20",
      )}
      style={{
        width: `90px`,
        left: `calc((${activeIndex} * 90px) + 4px)`,
      }}
    />
  );
};
