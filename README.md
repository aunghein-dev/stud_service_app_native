# Frontend (React Native + TypeScript)

## Quick start
1. `cd frontend`
2. `npm install`
3. `npm run start`
4. Set API URL in root `.env` as `EXPO_PUBLIC_API_BASE_URL`.

## App architecture
- `src/navigation`: app and stack/tab navigation
- `src/modules`: feature modules by domain
- `src/components`: reusable UI blocks
- `src/store`: Zustand modular stores
- `src/services`: API integration layer
- `src/types`: typed DTOs/entities

## Receipt support
- Receipt list and detail pages
- Print/share preview via `expo-print` + `expo-sharing`
- Uses backend receipt payload and receipt number search
