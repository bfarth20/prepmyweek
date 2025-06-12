import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex-col justify-center items-center bg-background text-gray-800 p-6">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-2">
          <img
            src="/logoNoBg.png"
            alt="PrepMyWeek Logo"
            className="w-24 h-24"
          />
          <h1 className="text-5xl font-bold font-brand text-brand">
            PrepMyWeek
          </h1>
        </div>
        <p className="text-xl text-gray-700">Plan smarter. Shop easier.</p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link to="/login">
            <Button>Log In</Button>
          </Link>
          <Link to="/signup">
            <Button>Sign Up</Button>
          </Link>
        </div>
        <Link to="/store">
          <Button variant="secondary">Continue as Guest</Button>
        </Link>
      </div>
    </div>
  );
}
