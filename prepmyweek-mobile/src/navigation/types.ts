export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  MainApp: undefined;
  Signup: undefined;
  Home: undefined;
  Recipes: undefined;
  Stores: undefined;
  CurrentPrep: undefined;
  PrepConfig: { storeId: number; storeName: string };
  RecipeDetail: {
    recipeId: number;
    showPrepTracker?: boolean;
  };
  RecipeSelect: {
    storeId: number;
    storeName: string;
  };
  FinalizePrep: undefined;
  GroceryList: { source: string };
  ForgotPassword: undefined;
  ReportBug: undefined;
  GuestStores: undefined;
  GuestRecipes: undefined;
  PersonalizeStores: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Recipes: undefined;
  GroceryList: undefined;
  Stores: undefined;
  Settings: undefined;
};
