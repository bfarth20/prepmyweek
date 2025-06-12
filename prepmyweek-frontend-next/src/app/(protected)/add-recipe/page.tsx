"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import AddRecipeForm from "@/components/AddRecipeForm";

export default function AddRecipePage() {
  const [error, setError] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-[0_0_20px_2px_rgba(0,0,0,0.3)] w-full max-w-4xl border border-orange-400 p-6">
        <h1 className="text-2xl text-center font-brand text-brand font-bold mb-4">
          Add a New Recipe
        </h1>
        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
            {error}
          </div>
        )}
        <AddRecipeForm onError={setError} />
      </div>
    </div>
  );
}
