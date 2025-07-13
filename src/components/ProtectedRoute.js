"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children, allowedRoles }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null); // null = loading

  useEffect(() => {
    const role = sessionStorage.getItem("role");
    if (!role) {
      setIsAuthorized("unauthorized");
    } else if (!allowedRoles.includes(role)) {
      setIsAuthorized("forbidden");
    } else {
      setIsAuthorized("authorized");
    }
  }, [allowedRoles]);

  if (isAuthorized === null) {
    return <p className="p-4">🔒 Loading...</p>;
  }

  if (isAuthorized === "unauthorized") {
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        🚫 You are not logged in.
      </div>
    );
  }

  if (isAuthorized === "forbidden") {
    return (
      <div className="p-6 text-center text-orange-500 font-semibold">
        🔐 You do not have access to this page.
      </div>
    );
  }

  return children;
}
