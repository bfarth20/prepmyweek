import { Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage.jsx";
import HomePage from "./pages/HomePage.jsx";
import StoresSelectionPage from "./pages/StoresSelectionPage.jsx";
import RecipesPage from "./pages/RecipesPage.jsx";
import GroceryListPage from "./pages/GroceryListPage.jsx";
import AddRecipePage from "./pages/AddRecipePage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import AppLayout from "./components/layout/AppLayout";
import PublicLayout from "./components/layout/PublicLayout.jsx";

function App() {
  return (
    <Routes>
      {/* Pages with AppLayout (Navbar + Sidebar logic) */}
      <Route element={<AppLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/stores" element={<StoresSelectionPage />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/grocery-list" element={<GroceryListPage />} />
        <Route path="/add-recipe" element={<AddRecipePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Public routes that don't need sidebar */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
