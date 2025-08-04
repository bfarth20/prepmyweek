# PrepMyWeek

**Meal planning made easy.**  
Choose your grocery store, get curated recipes, and generate a smart grocery list.

---

## Project Structure

This repo contains both the frontend and backend:

- `prepmyweek-backend/` – Node.js, Express, Prisma, PostgreSQL
- `prepmyweek-frontend/` – Old Vite/React frontend (archived)
- `prepmyweek-frontend-next/` – New Next.js + TypeScript frontend (active)
- `prepmyweek-mobile/` – React Native mobile app built with Expo (active)

### Why the switch?

Mid-project, I realized the advantages of migrating to a Next.js + TypeScript stack:

- Real-world job alignment
- Better routing and SSR support
- Easier deployment with Vercel
- Improved file structure and performance

Rather than delete the old Vite code, I’ve kept it in this repo to showcase my progression and decision-making process.

---

## How to Run

### Backend

```bash
cd prepmyweek-backend
npm install
npm run dev
```

### Frontend

```bash
cd prepmyweek-frontend-next
npm install
npm run dev
```

(Frontend runs on localhost:3001, backend on localhost:3000)

### Mobile App

```bash
cd prepmyweek-mobile
npm install
npx expo start

### Auth

Authentication is handled via JWT and context hooks.
Pages are protected both client- and server-side.

### Features

-smart recipe selection based on store inventory
-Grocery list generation grouped by store section
-Admin panel to approve/reject user-submitted recipes
-Save/view/edit preps by week
-Full CRUD for recipes and ingredients
-Mobile Support for all major features

## Author

Benjamin Farthing - [Linkedin](https://www.linkedin.com/in/benjamin-farthing-397a3064/)
BootCamp Capstone Project, now fully fledged product 2025

```

```

```
