"use client";

import { useEffect, useState } from "react";
import { usePrep } from "@/components/context/PrepContext";
import {
  getGroupedIngredients,
  formatSectionName,
} from "@/lib/getGroupedIngredients";
import { Button } from "@/components/ui/Button";
import { useRouter, useSearchParams } from "next/navigation";
import API_BASE_URL from "@/lib/config";
import type { NormalizedRecipe } from "@/lib/types"; //<-- needs axios

export default function GroceryList() {
  const { selectedDinners, selectedLunches, clearPrep } = usePrep();
  const searchParams = useSearchParams();
  const source = searchParams.get("source");

  const router = useRouter();
  const [recipes, setRecipes] = useState<NormalizedRecipe[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecipes = async () => {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams(window.location.search);
      const pastId = params.get("id");

      if (!token) {
        setError("You must be logged in to view your grocery list.");
        setLoading(false);
        return;
      }

      try {
        if (source === "current") {
          const res = await fetch(`${API_BASE_URL}/current-prep`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            const { error } = await res.json();
            setError(error || "Failed to load current prep.");
            setLoading(false);
            return;
          }

          const data = await res.json();
          setRecipes(data.data.recipes);
        } else if (source === "past" && pastId) {
          const res = await fetch(`${API_BASE_URL}/past-preps/${pastId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            const { error } = await res.json();
            setError(error || "Failed to load past prep.");
            setLoading(false);
            return;
          }

          const data = await res.json();
          setRecipes(data.data.recipes);
        } else {
          // fallback for manual mode
          setRecipes([...selectedDinners, ...selectedLunches]);
        }
      } catch (err) {
        console.error("Failed to fetch recipes:", err);
        setError("An error occurred while loading recipes.");
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, [source, selectedDinners, selectedLunches]);

  const grouped = getGroupedIngredients(recipes);

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  }

  if (recipes.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center mt-10">
        <p className="text-gray-600 mb-4">No recipes selected yet.</p>
        <Button onClick={() => router.push("/stores")} variant="default">
          Start a Prep
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-brand font-bold">Grocery List</h1>
        <Button
          variant="outline"
          onClick={() => {
            clearPrep();
            router.push("/stores");
          }}
        >
          Start Fresh Prep
        </Button>
      </div>

      {Array.from(grouped.entries()).map(([storeSection, items]) => (
        <div key={storeSection} className="mb-4">
          <h2 className="font-semibold text-brand text-lg mb-2">
            {formatSectionName(storeSection)}
          </h2>
          <div className="ml-5 space-y-1">
            {Array.from(items.values()).map((ingredient) => {
              const id = `chk-${ingredient.name}-${ingredient.unit}`
                .replace(/\s+/g, "-")
                .toLowerCase();
              return (
                <div key={id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={id}
                    name="ingredients"
                    value={`${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`}
                    className="mr-2"
                  />
                  <label htmlFor={id}>
                    {`${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
