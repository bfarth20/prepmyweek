import Navbar from "../Navbar";
import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 p-6 bg-color-background">
        {/* This will render the route’s page */}
        <Outlet />
      </main>
    </div>
  );
}
