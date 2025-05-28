import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";
import { useAuth } from "../components/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/Input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate("/home");
      console.log("Login successful");
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-color-background flex flex-col items-center justify-center px-4">
      {/* Logo and Header */}
      <div className="flex items-center gap-2 mb-8">
        <img src="/logoNoBg.png" alt="PrepMyWeek Logo" className="w-20 h-20" />
        <h1 className="text-4xl font-bold font-brand text-brand">PrepMyWeek</h1>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-brand font-brand mb-6">
          Log In
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-brand hover:underline">
              Forgot your Password?
            </Link>
          </div>

          <Button type="submit" className="w-full mt-2">
            Log In
          </Button>
        </form>

        <p className="text-center text-sm mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-brand hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
