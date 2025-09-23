"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function NavAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setHasToken(Boolean(token));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setHasToken(false);
    router.push("/login");
    router.refresh();
  };

  if (hasToken) {
    return (
      <button onClick={handleLogout} className="text-gray-700 hover:text-blue-600">Logout</button>
    );
  }

  return (
    <>
      <a href="/login" className="text-gray-700 hover:text-blue-600">Login</a>
      <a href="/register" className="text-gray-700 hover:text-blue-600">Register</a>
    </>
  );
}
