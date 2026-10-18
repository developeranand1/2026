# KrisiMarg Field Officer & Operations Management Mobile App

A production-ready React Native (Expo) mobile application for on-ground field officers to start GPS-tagged work shifts, submit daily field logs, and log work-related expense claims (petrol, food allowance, lodging, farmer meetings).

---

## 📱 Features

1. **Dedicated Staff Authentication**:
   - Authenticates against internal Staff schema (`/api/staff/login`).
   - Distinct from public farmers/buyers.
2. **GPS-Tagged Shift Attendance**:
   - One-tap **"Start Work"** automatically captures GPS latitude, longitude, and area address with live shift counter.
   - One-tap **"End Shift"** records ending GPS location, distance covered (KM), farmers visited, and work summary report.
3. **Field Expense Logger**:
   - Log fuel, food DA, hotel stay, or farmer meeting expenses directly on the field.
   - Attach photo proof/receipts.
   - Real-time claim status: `PENDING` ➔ `APPROVED BY HR` ➔ `PAID / REIMBURSED`.
4. **Offline Resilience & Instant Sync**:
   - Local token persistence via `@react-native-async-storage/async-storage`.

---

## 🚀 How to Run Locally

```bash
cd field-app
npm install
npm start
```

- Press `a` in the terminal to launch the Android emulator.
- Or scan the QR code with the **Expo Go** app on any physical Android / iOS phone.

---

## 📦 How to Build the Standalone APK (Installable on Android Phones)

The project includes `eas.json` configured for direct APK generation without needing Google Play Store submission:

```bash
# 1. Install EAS CLI globally if not already installed
npm install -g eas-cli

# 2. Login to your free Expo account
npx eas login

# 3. Trigger 1-Click Cloud APK Build
npx eas build -p android --profile preview
```

EAS Build will build the `.apk` on the cloud and give you a direct download link (or QR code) to install the `.apk` on any Android smartphone!

---

## 🔑 Default Staff Credentials for Testing

| Role | Mobile | Password | Notes |
|---|---|---|---|
| **CEO / Super Admin** | `9999999999` | `admin123` | Full access to Treasury, HR, Admin |
| **HR Manager** | `9876543210` | `password123` | Reviews field shifts & approves expense claims |
| **Accountant** | `9876543211` | `password123` | Disburses approved claims from Treasury |
| **Field Officer 1** | `9876543212` | `password123` | Assigned to Sant Kabir Nagar |
| **Field Officer 2** | `9876543213` | `password123` | Assigned to Gorakhpur |
