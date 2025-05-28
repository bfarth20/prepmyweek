import { Outlet } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../ui/SideBar";
import Navbar from "../Navbar";

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onLogoClick={user ? () => setIsSidebarOpen(true) : null} />

      <div className="flex flex-1">
        {user && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
        <main className="flex-1 p-6 bg-color-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
