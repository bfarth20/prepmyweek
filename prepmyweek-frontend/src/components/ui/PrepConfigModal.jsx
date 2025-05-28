"use client";
import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "./Button";
import { useNavigate } from "react-router-dom";

export default function PrepConfigModal({ isOpen, onClose, store }) {
  const navigate = useNavigate();

  const [numPeople, setNumPeople] = useState(1);
  const [numLunches, setNumLunches] = useState(5);
  const [numDinners, setNumDinners] = useState(5);
  const [useLeftovers, setUseLeftovers] = useState(false);

  const handleSubmit = () => {
    onClose();

    const query = new URLSearchParams({
      people: numPeople,
      lunches: numLunches,
      dinners: numDinners,
      leftovers: useLeftovers ? "yes" : "no",
    }).toString();

    navigate(`/stores/${store.id}/select-recipes?${query}`);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md space-y-4">
          <Dialog.Title className="text-xl font-bold font-brand text-brand">
            Customize Your Prep - {store?.name}
          </Dialog.Title>

          <div className="space-y-2">
            <label className="block">
              <span># of People</span>
              <input
                type="number"
                value={numPeople}
                min={1}
                onChange={(e) => setNumPeople(parseInt(e.target.value))}
                className="w-full border p-2 rounded"
              />
            </label>

            <label className="block">
              <span># of Lunches</span>
              <input
                type="number"
                value={numLunches}
                min={0}
                onChange={(e) => setNumLunches(parseInt(e.target.value))}
                className="w-full border p-2 rounded"
              />
            </label>

            <label className="block">
              <span>$ of Dinners</span>
              <input
                type="number"
                value={numDinners}
                min={0}
                onChange={(e) => setNumDinners(parseInt(e.target.value))}
                className="w-full border p-2 rounded"
              />
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useLeftovers}
                onChange={(e) => setUseLeftovers(e.target.checked)}
              />
              <span>Use leftover dinner servings for lunches?</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Continue</Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
