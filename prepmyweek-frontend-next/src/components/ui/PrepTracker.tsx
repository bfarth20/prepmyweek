"use client";

import { useRouter } from "next/navigation";
import { usePrep } from "@/components/context/PrepContext";
import { Button } from "@/components/ui/Button";

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
    <div className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-xl p-4 w-72 border text-sm space-y-1">
      <h3 className="text-lg font-semibold mb-2">Prep Progress</h3>
      <p>
        🍽️ Dinner servings: {dinnerServingsSelected} /{" "}
        {totalDinnerServingsNeeded}
      </p>
      <p>
        🥪 Lunch servings: {totalLunchServingsCounted} /{" "}
        {totalLunchServingsNeeded}
      </p>
      {useLeftovers && (
        <p className="text-xs text-gray-500">
          Includes {leftoverLunchServings} from leftovers
        </p>
      )}
      <Button onClick={handleResetPrep} variant="default" className="w-full">
        Reset Prep
      </Button>
      {prepComplete && (
        <Button
          onClick={handleGoToSummary}
          variant="default"
          className="w-full"
        >
          Go to Finished Prep
        </Button>
      )}
    </div>
  );
}
