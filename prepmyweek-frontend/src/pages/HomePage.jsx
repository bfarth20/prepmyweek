import { Link } from "react-router-dom";
import { useAuth } from "../components/context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        Welcome, {user?.name || "Friend"}!
      </h1>

      <div className="grid gap-4">
        <Link
          to="/profile"
          className="block bg-white shadow p-4 rounded hover:bg-gray-50"
        >
          View Profile
        </Link>

        <Link
          to="/stores"
          className="block bg-brand text-white p-4 rounded hover:bg-green-600"
        >
          Start a Fresh Prep
        </Link>

        <Link
          to="/grocery-list"
          className="block bg-white shadow p-4 rounded hover:bg-gray-50"
        >
          View Current GroceryList
        </Link>

        <Link
          to="/grocery-list/saved"
          className="block bg-white shadoow p-4 rounded hover:bg-gray-50"
        >
          View saved Lists
        </Link>

        <Link
          to="/add-recipe"
          className="block bg-white shadow p-4 rounded hover:bg-gray-50"
        >
          Add a Recipe!
        </Link>
      </div>
    </div>
  );
}
