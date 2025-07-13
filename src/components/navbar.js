"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [role, setRole] = useState("guest");
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("role");
    if (stored === "1") setRole("buyer");
    else if (stored === "2") setRole("admin");
    else setRole("guest");
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("role");
    router.push("/login");
  };

  const menu = {
    guest: [
      { label: "Product", href: "/product" },
      { label: "Login", href: "/login" },
    ],
    buyer: [
      { label: "Product", href: "/product" },
      { label: "Cart", href: "/cart" },
      { label: "History", href: "/purchase-history" },
      { label: "Profile", href: "/profile" },
      { label: "Logout", onClick: handleLogout },
    ],
    admin: [
      { label: "Dashboard", href: "/admin/dashboard" },
      { label: "Product Management", href: "/admin/product" },
      { label: "Purchase Management", href: "/admin/purchases" },
      { label: "List User", href: "/admin/users" },
      { label: "Profile", href: "/profile" },
      { label: "Logout", onClick: handleLogout },
    ],
  };

  const navItems = menu[role] || menu["guest"];

  return (
    <>
      {/* Navbar */}
      <nav className="bg-[#2c7be5] text-white px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            MEDISHOP
          </Link>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Menu */}
          <ul className="hidden lg:flex flex-row items-center text-sm font-medium">
            {navItems.map((item, idx) =>
              item.href ? (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="hover:underline hover:text-gray-200 transition px-4"
                  >
                    {item.label}
                  </Link>
                </li>
              ) : (
                <li key={idx}>
                  <button
                    onClick={item.onClick}
                    className="hover:underline hover:text-gray-200 transition"
                  >
                    {item.label}
                  </button>
                </li>
              )
            )}
          </ul>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="lg:hidden bg-[#2c7be5] text-white p-4 space-y-4 shadow-md">
          {navItems.map((item, idx) =>
            item.href ? (
              <Link
                key={idx}
                href={item.href}
                className="block hover:underline hover:text-gray-200 transition"
                onClick={() => setSidebarOpen(false)} // close after click
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={idx}
                onClick={() => {
                  item.onClick?.();
                  setSidebarOpen(false);
                }}
                className="block w-full text-left hover:underline hover:text-gray-200 transition"
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </>
  );
}
