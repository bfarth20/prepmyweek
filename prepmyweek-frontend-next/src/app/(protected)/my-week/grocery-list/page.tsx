"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import GroceryList from "@/components/GroceryList";

export default function GroceryListPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <div className="flex justify-center items-start min-h-screen py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-xl">
        <GroceryList />
      </div>
    </div>
  );
}
