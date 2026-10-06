# MSME FinTech Mobile App (Part 1 Foundation)

This is the React Native frontend for the Cloud-Native Multi-Tenant FinTech Platform.

## Installation
1. Ensure Node.js is installed.
2. In the `mobile` directory, run:
```bash
npm install
```

## Running the App
To start the Expo development server:
```bash
npm run start
```
You can use the Expo Go app on your phone, or press `a` for Android Emulator / `i` for iOS Simulator (macOS only) in the terminal menu.

## Project Structure
```text
src/
  components/  - Reusable UI components (buttons, inputs, cards, state handlers)
  constants/   - Theme, colors, typography, routes
  mock/        - Mock data for Part 1 development
  navigation/  - React Navigation structure (Root, Auth, App)
  screens/     - Application screens organized by feature
  services/    - API abstractions and data fetching logic
  theme/       - Centralized design system
  types/       - TypeScript definitions for domain models
  utils/       - Helper functions (formatting, validation)
```

## Navigation Structure
- **RootNavigator**: Switches between Auth and App flows.
- **AuthNavigator**: Login, Register.
- **AppNavigator**: Home, Products, Sales, Inventory, Customers, Suppliers, Expenses, Reports, Settings, etc.

## Mock Data
Currently, the app uses local mock data located in `src/mock/`. The service layer (`src/services/`) returns this mock data to the screens. In future phases, these services will be updated to fetch data from the actual backend API without requiring changes to the UI components.

## API Configuration
The base URL for the backend API is configured in `src/services/api/apiClient.ts`.
Currently it defaults to `http://localhost:3000/api/v1`.
In the future, this should be set via environment variables (e.g., using `expo-env` or `.env`).

## Future Backend Endpoints
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/me`
- `GET /api/v1/categories`
- `POST /api/v1/categories`
- `PUT /api/v1/categories/{id}`
- `DELETE /api/v1/categories/{id}`
- `GET /api/v1/products`
- `POST /api/v1/products`
- `PUT /api/v1/products/{id}`
- `DELETE /api/v1/products/{id}`
- `GET /api/v1/inventory`
- `POST /api/v1/inventory/restock`
- `POST /api/v1/sales`
- `GET /api/v1/sales`
- `GET /api/v1/sales/{id}`
- `POST /api/v1/purchases`
- `GET /api/v1/purchases`
- `GET /api/v1/customers`
- `POST /api/v1/customers`
- `PUT /api/v1/customers/{id}`
- `GET /api/v1/customers/{id}`
- `POST /api/v1/customers/{id}/payments`
- `GET /api/v1/suppliers`
- `POST /api/v1/suppliers`
- `PUT /api/v1/suppliers/{id}`
- `GET /api/v1/suppliers/{id}`
- `POST /api/v1/suppliers/{id}/payments`
- `POST /api/v1/expenses`
- `GET /api/v1/expenses`
- `GET /api/v1/ledger`
- `GET /api/v1/reports/sales`
- `GET /api/v1/reports/profit-loss`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/health`

## Known TODOs for Future Phases
- **Part 2**: Implement real JWT authentication and secure token storage (`expo-secure-store`). Integrate Auth API.
- **Part 2/3**: Connect all frontend services to their corresponding real backend endpoints using the `apiClient`.
- **Part 2/3**: Replace mock data handling with real API requests, handling loading/error states properly.
- **Part 4**: Define exact backend environment variables for dev/prod builds in Azure container deployment environments.
