import { useState } from "react";
import { useAuth } from "../components/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/input";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await signup(name, email, password);
    console.log("Signup result:", success);
    if (success) {
      navigate("/home");
    } else {
      alert("Signup failed, Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-color-background flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-2 mb-8">
        <img
          src="/public/logoNoBg.png"
          alt="PrepMyWeek Logo"
          className="w-20 h-20"
        />
        <h1 className="text-4xl font-bold font-brand text-brand">PrepMyWeek</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-brand font-brand mb-6">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full mt-2">
            Sign Up
          </Button>
        </form>
      </div>
    </div>
  );
}
