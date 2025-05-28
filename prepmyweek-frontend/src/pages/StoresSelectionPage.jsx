"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StoreCard from "../components/ui/StoreCard";
import { Button } from "../components/ui/Button";
import axios from "axios";
import API_BASE_URL from "../config";
import PrepConfigModal from "../components/ui/PrepConfigModal";

export default function StoresSelectionPage() {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStores() {
      try {
        const response = await axios.get(`${API_BASE_URL}/stores`);
        console.log("API Response for stores:", response.data);
        setStores(response.data);
      } catch (err) {
        console.error("Failed to load stores:", err);
      }
    }

    fetchStores();
  }, []);

  const handleStoreSelect = (store) => {
    console.log("Store selected:", store);
    setSelectedStore(store);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStore(null);
  };

  const handlePrepConfigSubmit = (prepConfig) => {
    const query = new URLSearchParams({
      storeId: selectedStore.id,
      people: prepConfig.numPeople,
      lunches: prepConfig.numLunches,
      dinners: prepConfig.numDinners,
      leftovers: prepConfig.useLeftovers ? "true" : "false",
    }).toString();

    navigate(`/recipes/select?${query}`);
  };

  return (
    <div className="min-h-screen bg-background text-gray-900 p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-brand text-brand mb-2">
          StartMyPrep
        </h1>
        <p className="text-lg text-gray-700">Select your store</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {stores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            onSelect={() => handleStoreSelect(store)}
          />
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button variant="outline" size="lg">
          Add a Grocery Store
        </Button>
      </div>

      {isModalOpen && selectedStore && (
        <PrepConfigModal
          store={selectedStore}
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handlePrepConfigSubmit}
        />
      )}
    </div>
  );
}
