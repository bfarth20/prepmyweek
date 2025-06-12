"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { PrepTracker } from "@/components/ui/PrepTracker";
import RecipeCard from "@/components/ui/RecipeCard";
import { usePrep } from "@/components/context/PrepContext";
import type { RecipeSummary } from "@/lib/types";

export default function StoreRecipeClientPage({
  recipes,
}: {
  recipes: RecipeSummary[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { addDinner, addLunch } = usePrep();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) return null;

  const handleAddToPrep = (recipe: RecipeSummary) => {
    if (recipe.course === "LUNCH") {
      addLunch(recipe);
    } else {
      addDinner(recipe); // fallback for DINNER or anything else
    }
  };

  return (
    <main className="p-6 max-w-7xl mx-auto relative">
      <PrepTracker />

      <h1 className="text-2xl font-bold mb-6">Recipes from This Store</h1>
      {recipes.length === 0 ? (
        <p className="text-gray-500">No recipes found for this store.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onAddToPrep={handleAddToPrep}
            />
          ))}
        </div>
      )}
    </main>
  );
}
