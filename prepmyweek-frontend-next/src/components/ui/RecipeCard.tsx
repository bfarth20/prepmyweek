"use client";

import Link from "next/link";
import Image from "next/image";
import { RecipeSummary } from "@/lib/types";

type RecipeCardProps = {
  recipe: RecipeSummary;
  onAddToPrep?: (recipe: RecipeSummary) => void;
};

export default function RecipeCard({ recipe, onAddToPrep }: RecipeCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white flex flex-col h-full">
      {recipe.imageUrl && (
        <div className="relative w-full aspect-[4/3] mb-3 overflow-hidden rounded-md">
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <Link href={`/recipes/${recipe.id}`} className="flex-1">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{recipe.title}</h2>
          <p className="text-sm text-gray-600">
            Total Time: {recipe.totalTime ?? "??"} min
          </p>
          <p className="text-sm text-gray-600">
            Servings: {recipe.servings ?? "??"}
          </p>
          <p className="text-sm text-gray-600">
            Ingredients: {recipe.ingredientCount ?? 0}
          </p>
        </div>
      </Link>

      {onAddToPrep && (
        <button
          onClick={() => onAddToPrep(recipe)}
          className="mt-4 bg-brand text-white rounded-md py-2 px-3 text-sm font-medium hover:bg-brand-dark"
        >
          Add to Prep
        </button>
      )}
    </div>
  );
}
