import { Link } from "react-router-dom";

export default function StoreCard({ store, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className="rounded-2xl shadow-md p-4 bg-white hover:shadow-lg transition-shadow flex items-center gap-4"
    >
      {store.logoUrl ? (
        <img
          src={store.logoUrl}
          alt={`${store.name} logo`}
          className="w-16 h-16 object-contain rounded-md"
        />
      ) : (
        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-sm text-gray-500">
          No Logo
        </div>
      )}
      <h3 className="text-xl font-brand color-brand">{store.name}</h3>
    </div>
  );
}
