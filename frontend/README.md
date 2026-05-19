#  GAS MTAANI - Frontend Command Center

This is a production-grade React SPA (Single Page Application) optimized for high-density logistics data and industrial aesthetics.

##  Architecture & Rendering
The frontend utilizes **Vite** for ultra-fast HMR (Hot Module Replacement) and a **Context-Driven State Pattern** to manage cross-component synchronization.

## State Management Deep-Dive
### 1. AuthContext
* **Lifecycle:** On mount, checks `localStorage` for `gas_token`.
* **Roles:** Decodes user object to distinguish between `admin` and `buyer`.
* **Persistence:** Handles logout by clearing tokens and resetting the global user state.

### 2. CartContext
* **Persistence:** Synchronizes the "Bundle" count across all pages.
* **Logic:** Automatically calculates totals, taxes, and quantity adjustments in real-time.

## Key Logic & Components
### Flash Sale Engine (`ProductCard.jsx`)
* **Mechanism:** A `useEffect` hook runs a 1000ms interval. It calculates the delta between the server's `deal_end_time` and the browser's `Date.now()`.
* **Auto-Reversion:** Once the delta hits 0, the component triggers `onExpiry`, ensuring the user can only buy at the deal price while the timer is active.

### Admin "Control Room"
* **Analytics:** Aggregates order data into "Live Metrics" cards using real-time data fetching.
* **Inventory Control:** A complex form that allows partial updates (`PATCH`) to MongoDB documents, enabling time-sensitive price drops and stock management.

##  Responsive Strategy
* **Mobile:** Sidebar becomes an overlay (`z-index: 100`).
* **Desktop:** Sidebar is fixed (`margin-left: 18rem`).
* **Data Safety:** All industrial tables use `overflow-x-auto` to prevent layout breaking on small screens.

##  Folder Responsibilities
* `/component`: Reusable UI atoms (Navbar, Sidebar, ProductCard).
* `/context`: Logic for Auth and Cart lifecycles.
* `/pages`: Complex views (AdminDashboard, Checkout, ProductManagement).
