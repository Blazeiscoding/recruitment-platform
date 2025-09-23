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
        const res = await fetch("/api/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });
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
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl card">
      <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
      <p className="text-gray-600 mb-6">Public details about your account</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Name"
          value={`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()}
        />
        <Field label="Email" value={user.email ?? ""} />
        <Field label="Phone" value={user.phone ?? ""} />
        <Field label="Headline" value={user.headline ?? ""} />
        <Field label="Location" value={user.location ?? ""} />
        <Field label="Experience (years)" value={user.experienceYears ?? ""} />
        <Field label="LinkedIn" value={user.linkedinUrl ?? ""} isLink />
        <Field label="Portfolio" value={user.portfolioUrl ?? ""} isLink />
        <div className="md:col-span-2">
          <Field
            label="Skills"
            value={
              user.skills && user.skills.length ? user.skills.join(", ") : ""
            }
          />
        </div>
        <div className="md:col-span-2">
          <Field label="Bio" value={user.bio ?? ""} multiline />
        </div>
        <div className="md:col-span-2">
          <Field
            label="Joined"
            value={new Date(user.createdAt).toLocaleString()}
          />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, isLink = false, multiline = false }) {
  const content = !value ? (
    <span className="text-gray-400">—</span>
  ) : isLink ? (
    <a
      href={value}
      target="_blank"
      rel="noreferrer"
      className="text-blue-600 hover:underline break-all"
    >
      {value}
    </a>
  ) : (
    <span className={multiline ? "whitespace-pre-wrap" : ""}>{value}</span>
  );
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="mt-1 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 min-h-[40px]">
        {content}
      </div>
    </div>
  );
}
