const imageMap: { [key: string]: any } = {
  "/Images/Recipes/Bbq.png": require("../../assets/Recipes/Bbq.png"),
  "/Images/Recipes/Breakfast.png": require("../../assets/Recipes/Breakfast.png"),
  "/Images/Recipes/Burger.png": require("../../assets/Recipes/Burger.png"),
  "/Images/Recipes/Casserole.png": require("../../assets/Recipes/Casserole.png"),
  "/Images/Recipes/Chicken.png": require("../../assets/Recipes/Chicken.png"),
  "/Images/Recipes/Dessert.png": require("../../assets/Recipes/Dessert.png"),
  "/Images/Recipes/Fish.png": require("../../assets/Recipes/Fish.png"),
  "/Images/Recipes/LettuceWrap.png": require("../../assets/Recipes/LettuceWrap.png"),
  "/Images/Recipes/Mexican.png": require("../../assets/Recipes/Mexican.png"),
  "/Images/Recipes/Pasta.png": require("../../assets/Recipes/Pasta.png"),
  "/Images/Recipes/Pie.png": require("../../assets/Recipes/Pie.png"),
  "/Images/Recipes/Pizza.png": require("../../assets/Recipes/Pizza.png"),
  "/Images/Recipes/Pork.png": require("../../assets/Recipes/Pork.png"),
  "/Images/Recipes/RiceBowl.png": require("../../assets/Recipes/RiceBowl.png"),
  "/Images/Recipes/Salad.png": require("../../assets/Recipes/Salad.png"),
  "/Images/Recipes/Sandwich.png": require("../../assets/Recipes/Sandwich.png"),
  "/Images/Recipes/Seafood.png": require("../../assets/Recipes/Seafood.png"),
  "/Images/Recipes/Soup.png": require("../../assets/Recipes/Soup.png"),
  "/Images/Recipes/StirFry.png": require("../../assets/Recipes/StirFry.png"),
};

export function getRecipeImage(imageUrl?: string) {
  if (!imageUrl) return null;
  return imageMap[imageUrl] || null; // returns require(...) or null if not found
}
