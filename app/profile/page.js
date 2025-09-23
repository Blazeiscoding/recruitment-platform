"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/auth/verify", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUser(data.data.user);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">Your Profile</h1>
      <div className="space-y-2">
        <div><span className="font-medium">Name:</span> {user.firstName} {user.lastName}</div>
        <div><span className="font-medium">Email:</span> {user.email}</div>
        <div><span className="font-medium">Joined:</span> {new Date(user.createdAt).toLocaleString()}</div>
      </div>
    </div>
  );
}


