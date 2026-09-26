# Sahayak (100% Completion Milestone)

Sahayak is a community assistance platform designed for the seniors of Shirva, Udupi. This monorepo contains the complete full-stack architecture for the project.

## 📂 Project Structure
- **`/backend`**: Node.js/Express routing engine connected to Supabase (PostgreSQL) and Supabase Storage for raw audio files.
- **`/app-senior`**: React Native (Expo) frontend for senior citizens featuring a zero-friction audio-recording interface.
- **`/app-volunteer`**: React Native (Expo) frontend for local volunteers to listen to Tulu audio requests and accept tasks.

## 🚀 Tech Stack
- **Database:** Supabase (PostgreSQL) & Prisma ORM
- **Cloud Storage:** Supabase Storage (for `.m4a` files)
- **Backend:** Node.js, Express, Multer
- **Frontend:** React Native, Expo, NativeWind

## 🗺️ 100% Milestone Progress
- [x] Supabase Database Initialization
- [x] Prisma Schema & Migration
- [x] Supabase Cloud Storage Audio Integration
- [x] Backend API live database overhaul
- [ ] Firebase Authentication (Phone SMS)
- [ ] Firebase Cloud Messaging (Push Notifications)
- [ ] Frontend Audio integration (`expo-av`)
