import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-color-background px-4 text-center">
      <img src="/404.png" alt="PrepMyWeek Sad Logo" className="w-60 h-60" />

      <h1 className="text-6xl font-bold text-brand font-brand mb-4">404</h1>
      <p className="text-lg text-gray-700 mb-6">
        Oops! The page you are looking for does not exist.
      </p>
      <Button asChild>
        <Link to="/">Go Back Home</Link>
      </Button>
    </div>
  );
}
