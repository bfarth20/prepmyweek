# 📱 PrepMyWeek Mobile

Cross-platform mobile app for **PrepMyWeek**  
Built with [Expo SDK 53](https://docs.expo.dev/versions/latest/), React Native, and TypeScript.

---

## 📦 Project Overview

This mobile app allows users to:

- Log in or register
- Select a grocery store
- Choose meals based on store inventory
- Track meal prep progress (dinners, lunches, leftovers)
- View detailed recipes
- Generate and view a grocery list
- Upload new recipes (admin approval required)
- Access saved or current week preps

Backend: [prepmyweek-backend](../prepmyweek-backend)  
Frontend Web Version: [prepmyweek-frontend-next](../prepmyweek-frontend-next)

---

## 🚀 Getting Started

### 1. Install dependencies

````bash
cd prepmyweek-mobile
npm install

###2. Start the dev server

```bash
npx expo start
````

Open in:
-iOS simulator: npm run ios
-Android emulator: npm run android
-Web (optional): npm run web

---

### 🛠️ Architecture

-React Native + Expo
-React Navigation for tab and stack navigation
-Axios for API communication
-AsyncStorage + expo-secure-store for persistent login
-Custom dev client with expo-dev-client for native module support

### Navigation Structure

The app’s navigation uses React Navigation with nested navigators for a smooth user experience:

### RootNavigator (Native Stack)

-Welcome — Entry landing screen for new/guest users
-Login — Login screen
-Signup — Signup screen
-ForgotPassword — Password reset screen
-MainApp — Main app area (bottom tab navigator)
-RecipeDetail — Recipe detail screen (can be pushed from various flows)

### MainAppNavigator (Bottom Tab Navigator)

-Tabs shown after login or in main app flow:
-Home — Home screen (dashboard or overview)
-Recipes — Current prep overview screen
-GroceryList — Grocery list screen
-Stores — Prep workflow stack (nested stack navigator)
-Settings — Settings stack (nested stack navigator)

### PrepStackNavigator (Native Stack)

-Manages the prep creation workflow:
-Stores — Grocery store selection
-PrepConfig — Configure number of meals, servings, etc.
-RecipeSelect — Select recipes for the prep
-FinalizePrep — Final review and confirmation

### SettingsStackNavigator (Native Stack)

-Manages user settings and feedback:
-SettingsMain — Main settings screen
-ReportBug — Submit feedback/bug report screen
-PersonalizeStores — Customize store names screen

### Fonts

-Google Fonts via @expo-google-fonts/inter and montserrat

---

### 🔐 Authentication

-Token-based (JWT)
-Stored using expo-secure-store
-AuthContext tracks user session and injects token into API headers

---

### 🔌 Native Modules

-We use native modules via EAS builds:
-expo-secure-store: for storing auth tokens securely
-expo-font: custom fonts
-expo-status-bar: UI polish
-@react-native-picker/picker: used in store/meal selections
-react-native-reanimated, gesture-handler: navigation animations
-⚠️ Some modules require expo-dev-client to work in local dev. This is already installed and configured.

---

### Testing Locally

Make sure your backend server is running at the correct host.
You can temporarily update the API base URL in your Axios instance:

```bash
// api.ts
const BASE_URL = "http://<your-local-ip>:3000/api";
```

Use if (**DEV**) logic to switch automatically if needed.

---

### Building for Production

### iOS Build

```bash
eas build -p ios --profile production
```

### Android Build

```bash
eas build -p android --profile production
```

Make sure to run:

```bash
eas login
eas build:configure
```

before your first build.

Builds are managed via EAS, not the classic expo build flow.

### File Structure

```bash
prepmyweek-mobile/
├── assets/               # Fonts, images, icons
├── src/components/          # Shared UI components
├── src/context/             # Auth provider, API context
├── src/navigation/              # React Navigation setup and stacks
├── src/screens/               # Screen components for app views
├── src/theme/              # Colors, fonts, and styling constants
├── src/types/         # TypeScript type definitions
├── src/utils/         # Utility functions and helpers
├── app.json             # Expo configuration file.
├── App.tsx              # Main entry point of the React Native app, wraps navigation and context providers.
├── eas.json             # Expo Application Services build configuration.
├── index.ts              # Entry file
└── README.md             # You are here
```

---

### Author

Benjamin Farthing - [Linkedin](https://www.linkedin.com/in/benjamin-farthing-397a3064/)
BootCamp Capstone Project, now fully fledged product 2025
