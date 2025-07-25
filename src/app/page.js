"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    if (!token) {
      // have not logged in
      router.replace("/login");
    } else {
      // already logged in
      if (role === "admin") {
        router.replace("/dashboard");
      } else {
        router.replace("/products");
      }
    }
  }, [router]);

  return null;
}
