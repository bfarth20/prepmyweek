import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ onLogoClick }) {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick(); // logged in → open sidebar
    } else {
      console.log("Navigating to /");
      navigate("/"); // not logged in → go home
    }
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <button
        onClick={handleLogoClick}
        className="m-0 p-0 block hover:cursor-pointer"
      >
        <img
          src="/logoNoPad.jpeg"
          alt="PrepMyWeek logo"
          className="h-10 w-auto"
        />
      </button>

      <div className="space-x-4">
        <Link to="/login" className="text-gray-700 hover:text-gray-900">
          Log In
        </Link>
        <Link
          to="/signup"
          className="bg-brand text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
