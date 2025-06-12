"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import Link from "next/link";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.replace("/"); // redirect non-admins
    }
  }, [user, loading, router]);

  if (loading) return <p>Loading...</p>;

  if (!user?.isAdmin) return <p>Access denied.</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <div className="grid gap-4">
        <Link
          href="/admin/pending-recipes"
          className="block bg-white shadow p-4 rounded hover:bg-gray-50"
        >
          Manage Pending Recipes
        </Link>

        <Link
          href="/admin/all-recipes"
          className="block bg-white shadow p-4 rounded hover:bg-gray-50"
        >
          Manage All Recipes
        </Link>

        <Link
          href="/admin/all-stores"
          className="block bg-white shadow p-4 rounded hover:bg-gray-50"
        >
          Manage Stores
        </Link>
      </div>
    </div>
  );
}
