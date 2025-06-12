"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { usePrep } from "@/components/context/PrepContext";
import RecipeCard from "@/components/ui/RecipeCard";
import { Button } from "@/components/ui/Button";
import API_BASE_URL from "@/lib/config";
import axios from "axios";

export default function WeekSummaryPage() {
  const { selectedDinners, selectedLunches } = usePrep();
  const { user, loading, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) return null;

  const handleSaveCurrentPrep = async () => {
    const confirmed = window.confirm(
      "This will overwrite your previous CurrentPrep. Continue?"
    );
    if (!confirmed) return;

    const recipeIds = [...selectedDinners, ...selectedLunches].map((recipe) =>
      recipe.id.toString()
    );

    if (!token) {
      alert("You must be logged in to save your prep.");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/current-prep`,
        { recipeIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("CurrentPrep saved!");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(
          "Failed to save prep: " +
            (error.response?.data?.error || error.message)
        );
      } else {
        alert("An error occurred while saving your prep.");
      }
      console.error("Error saving current prep:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold font-brand">Your Week Summary</h1>

      {selectedDinners.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold font-brand mb-2">
            Dinner Recipes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedDinners.map((recipe) => (
              <RecipeCard key={`dinner-${recipe.id}`} recipe={recipe} />
            ))}
          </div>
        </div>
      )}

      {selectedLunches.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mt-6 mb-2">Lunch Recipes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedLunches.map((recipe) => (
              <RecipeCard key={`lunch-${recipe.id}`} recipe={recipe} />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8">
        <Button variant="secondary" href="/home">
          Back to Homepage
        </Button>
        <Button variant="default" onClick={handleSaveCurrentPrep}>
          Save as Current Prep
        </Button>
        <Button variant="default" href="/my-week/grocery-list">
          View Grocery List
        </Button>
      </div>
    </div>
  );
}
