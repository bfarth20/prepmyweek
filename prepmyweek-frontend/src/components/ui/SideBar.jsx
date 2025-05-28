import { Link, useNavigate } from "react-router-dom";
import { Button } from "./Button";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Backdrop - only shows when sidebar is open */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-70" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="h-full flex flex-col justify-between px-4 py-6">
          <div>
            {/* Navigation */}
            <nav className="space-y-4 text-sm">
              <Link
                to="/home"
                className="block text-gray-700 hover:text-brand font-medium"
              >
                Home
              </Link>
              <Link
                to="/store"
                className="block text-gray-700 hover:text-brand font-medium"
              >
                Store Selection
              </Link>
              <Link
                to="/recipes"
                className="block text-gray-700 hover:text-brand font-medium"
              >
                Recipes
              </Link>
              <Link
                to="/profile"
                className="block text-gray-700 hover:text-brand font-medium"
              >
                Go to Profile
              </Link>
            </nav>
          </div>

          {/* Logout Button */}
          <div>
            <Button onClick={handleLogout} className="w-full" variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
