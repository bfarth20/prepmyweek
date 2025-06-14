"use client";

import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {user?.isAdmin && (
        <p className="mb-4 text-green-600 font-semibold">sup dude</p>
      )}
      <h1 className="text-3xl font-bold mb-4">
        Welcome, {user?.name || "Friend"}!
      </h1>

      <div className="grid gap-4">
        <Link
          href="/profile"
          className="block bg-white shadow p-4 rounded hover:bg-gray-50 transition-transform duration-100 active:scale-95"
        >
          View MyRecipes
        </Link>

        <Link
          href="/stores"
          className="block bg-brand text-white p-4 rounded hover:bg-green-600 transition-transform duration-100 active:scale-95"
        >
          Start a Fresh Prep
        </Link>

        <Link
          href="/current-prep"
          className="block bg-white shadow p-4 rounded hover:bg-gray-50 transition-transform duration-100 active:scale-95"
        >
          View CurrentPrep
        </Link>

        <Link
          href="/past-preps"
          className="block bg-white shadow p-4 rounded hover:bg-gray-50 transition-transform duration-100 active:scale-95"
        >
          View PastPreps
        </Link>

        <Link
          href="/add-recipe"
          className="block bg-white shadow p-4 rounded hover:bg-gray-50 transition-transform duration-100 active:scale-95"
        >
          Add a Recipe!
        </Link>
        {user?.isAdmin && (
          <Link
            href="/admin"
            className="block bg-white shadow p-4 rounded hover:bg-gray-50 mb-4 transition-transform duration-100 active:scale-95"
          >
            Go To Admin Panel
          </Link>
        )}
      </div>
    </div>
  );
}
