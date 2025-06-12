import { notFound } from "next/navigation";
import API_BASE_URL from "@/lib/config";
import StoreRecipeClientPage from "@/app/(protected)/stores/[id]/select-recipes/StoreRecipeClientPage"; //<-- axios and authContext

type Props = {
  params: { id: string };
};

export default async function StoreRecipesPage({ params }: Props) {
  const storeId = params.id;

  if (!storeId) {
    console.error("No storeId provided in params");
    notFound();
  }

  const res = await fetch(`${API_BASE_URL}/stores/${storeId}/recipes`, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch recipes for store:", storeId);
    notFound();
  }

  const json = await res.json();
  const recipes = json.data;

  return <StoreRecipeClientPage recipes={recipes} />;
}
