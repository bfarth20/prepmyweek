"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import API_BASE_URL from "@/lib/config";
import { useAuth } from "@/components/context/AuthContext"; //<--needs axios

export default function SaveToPastPrep({ recipeIds }: { recipeIds: number[] }) {
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState("");
  const { token } = useAuth();

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/past-preps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, recipeIds }),
      });

      if (!response.ok) throw new Error("Failed to save past prep");

      // Optionally reset state / show toast / redirect
      setShowDialog(false);
      setName("");
      alert("Prep saved!");
    } catch (err) {
      console.error("Save error:", err);
      alert("There was an error saving your prep.");
    }
  };

  return (
    <>
      <div className="mt-4">
        <Button onClick={() => setShowDialog(true)}>Save to Past Preps</Button>

        {showDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4">Name this prep</h2>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Weekday Favorites"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!name || recipeIds.length === 0}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
