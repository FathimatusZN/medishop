"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import Image from "next/image";

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
    sessionStorage.removeItem("user_id");
    router.push("/login");
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const menu = {
    guest: [
      { label: "Product", href: "/product" },
      { label: "Guestbook", href: "/guestbook" },
      { label: "Login", href: "/login" },
    ],
    buyer: [
      { label: "Product", href: "/product" },
      { label: "Cart", href: "/cart" },
      { label: "History", href: "/transactions" },
      { label: "Profile", href: "/profile" },
      { label: "Logout", onClick: handleLogout },
    ],
    admin: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Products", href: "/products" },
      { label: "Orders", href: "/orders" },
      { label: "Feedback", href: "/feedback" },
      { label: "Users", href: "/users" },
      { label: "Guestbook", href: "/guestbook-list" },
      { label: "Reports", href: "/reports" },
      { label: "Profile", href: "/profile" },
      { label: "Logout", onClick: handleLogout },
    ],
  };

  const navItems = menu[role] || menu["guest"];

  return (
    <>
      {/* Navbar */}
      <nav className="bg-[#2c7be5] text-white px-6 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/medishop2.png"
              alt="Medishop Logo"
              width={64}
              height={64}
              className="w-8 h-8"
            />
            <Link href="/" className="text-xl font-bold">
              MEDISHOP
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Menu */}
          <ul className="hidden lg:flex flex-row items-center text-sm font-medium">
            {navItems.map((item, idx) => {
              const isLogout = item.label === "Logout";
              return item.href ? (
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
                    className={`flex items-center gap-1 px-4 transition ${
                      isLogout
                        ? "text-black hover:text-red-400"
                        : "hover:underline hover:text-gray-200"
                    }`}
                  >
                    {isLogout && <LogOut size={16} />}
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="lg:hidden bg-[#2c7be5] text-white p-4 space-y-4 shadow-md">
          {navItems.map((item, idx) => {
            const isLogout = item.label === "Logout";
            return item.href ? (
              <Link
                key={idx}
                href={item.href}
                className="block hover:underline hover:text-gray-200 transition"
                onClick={() => setSidebarOpen(false)}
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
                className={`flex items-center gap-1 w-full text-left transition ${
                  isLogout
                    ? "text-black hover:text-red-400"
                    : "hover:underline hover:text-gray-200"
                }`}
              >
                {isLogout && <LogOut size={16} />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
