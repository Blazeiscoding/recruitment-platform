"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "./globals.css";

const RootLayout = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch("/api/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  if (loading) {
    return (
      <html lang="en">
        <body>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-lg">Loading...</div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex justify-between items-center py-4">
                <Link href="/" className="text-xl font-bold text-blue-600">
                  RecruitHub
                </Link>

                <div className="flex space-x-4">
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        className="text-gray-700 hover:text-blue-600"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="text-gray-700 hover:text-blue-600"
                      >
                        Logout
                      </button>
                      <span className="text-gray-600">
                        Welcome, {user.firstName}!
                      </span>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="text-gray-700 hover:text-blue-600"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="text-gray-700 hover:text-blue-600"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto py-6 px-4">{children}</main>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
