"use client";

import { useRouter } from "next/navigation";
import { usePrep } from "@/components/context/PrepContext";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export function PrepTracker() {
  const router = useRouter();

  const {
    selectedDinners,
    selectedLunches,
    numberOfPeople,
    numberOfDinners,
    numberOfLunches,
    useLeftovers,
    clearPrep,
  } = usePrep();

  const [minimized, setMinimized] = useState(false);

  const people = numberOfPeople || 1;
  const numDinners = numberOfDinners || 0;
  const numLunches = numberOfLunches || 0;

  const totalDinnerServingsNeeded = people * numDinners;
  const totalLunchServingsNeeded = people * numLunches;

  //Count only people servings per dinner recipe
  const dinnerServingsSelected = selectedDinners.length * people;

  //Count the extra servings per dinner recipe as lunch leftovers
  const leftoverLunchServings = useLeftovers
    ? selectedDinners.reduce((sum, recipe) => {
        const totalServings = recipe.servings || 0;
        const leftover = totalServings - people;
        return sum + Math.max(0, leftover);
      }, 0)
    : 0;

  const lunchServingsFromRecipes = selectedLunches.reduce(
    (sum, recipe) => sum + (recipe.servings || 0),
    0
  );

  const totalLunchServingsCounted =
    lunchServingsFromRecipes + leftoverLunchServings;

  const dinnersRemaining = Math.max(
    0,
    totalDinnerServingsNeeded - dinnerServingsSelected
  );

  const lunchesRemaining = Math.max(
    0,
    totalLunchServingsNeeded - totalLunchServingsCounted
  );

  const prepComplete = dinnersRemaining === 0 && lunchesRemaining === 0;

  const handleGoToSummary = () => {
    router.push("/my-week/summary");
  };

  const handleResetPrep = () => {
    clearPrep();
    router.push("/stores");
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 bg-white/90 shadow-lg rounded-xl p-2 w-auto max-w-[280px] border text-xs space-y-1 mx-2 sm:mx-0 transition-all duration-300`}
    >
      {/* Header with minimize toggle */}
      <div className="flex justify-between items-center mb-1">
        {!minimized ? (
          <h3 className="text-base font-semibold">Prep Progress</h3>
        ) : (
          // Invisible placeholder with same width as the title to preserve space
          <div className="invisible text-base font-semibold">Prep Progress</div>
        )}
        <button
          aria-label={
            minimized ? "Maximize prep progress" : "Minimize prep progress"
          }
          onClick={() => setMinimized(!minimized)}
          className="text-sm font-bold px-2 py-1 hover:bg-gray-200 rounded"
        >
          {minimized ? "➕" : "➖"}
        </button>
      </div>

      {/* Conditionally render the status text */}
      {!minimized && (
        <>
          <p className="leading-tight">
            🍽️ {dinnerServingsSelected} / {totalDinnerServingsNeeded} dinners
          </p>
          <p className="leading-tight">
            🥪 {totalLunchServingsCounted} / {totalLunchServingsNeeded} lunches
          </p>
          {useLeftovers && (
            <p className="text-[10px] text-gray-500 leading-tight">
              Includes {leftoverLunchServings} leftover lunches
            </p>
          )}
        </>
      )}

      {/* Buttons always visible */}
      <Button
        onClick={handleResetPrep}
        variant="default"
        className="w-full text-xs py-1 mt-1"
      >
        Reset Prep
      </Button>
      {prepComplete && (
        <Button
          onClick={handleGoToSummary}
          variant="default"
          className="w-full text-xs py-1 mt-1"
        >
          Finished Prep
        </Button>
      )}
    </div>
  );
}
