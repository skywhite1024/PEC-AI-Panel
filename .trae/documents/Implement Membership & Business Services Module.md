I will implement the new "Membership & Business Services" module as a full-screen overlay component, integrated into the existing React application.

### Directory Structure
I will create a new directory `components/Membership` to organize the code:
- `components/Membership/MembershipPage.tsx`: The main container managing the global state (Individual vs Enterprise) and layout.
- `components/Membership/IndividualView.tsx`: The view for individual users with monthly/yearly toggle.
- `components/Membership/EnterpriseView.tsx`: The view for enterprise users containing the 3 sub-tabs.
- `components/Membership/ProjectDesignService.tsx`: Tab A implementation (Design services with dynamic pricing).
- `components/Membership/PlatformSubscription.tsx`: Tab B implementation (Tiered subscriptions).
- `components/Membership/ProductCustomization.tsx`: Tab C implementation (Manufacturing with slider logic).
- `components/Membership/types.ts`: Shared TypeScript interfaces.

### Implementation Details

**1. MembershipPage (Main Container)**
- **UI:** A full-screen overlay with a dark blue radial gradient background (`bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81]`).
- **Navigation:** A top-level "Capsule Switch" to toggle between "Individual" and "Enterprise".
- **Close Button:** A button to return to the main app.

**2. IndividualView**
- **Features:**
  - Toggle switch for "Monthly" / "Yearly".
  - Two glassmorphism cards: "Free" (¥0) and "Pro" (¥129/mo).
  - Dynamic price update based on the billing cycle.

**3. EnterpriseView**
- **Navigation:** A secondary tab bar for "Project Design", "Platform Subscription", and "Product Customization".
- **State Management:** Handles tab switching.

**4. Tab A: Project Design Service**
- **Logic:**
  - Selectable "Standard" (¥800) vs "Pro" (¥1200) design types.
  - Selectable Quantity Tiers (1, 2-3, 4-6, ≥6).
  - **Price Calculation:** `(Base Price - Tier Discount) * Quantity`.
  - Displays a real-time quote list.

**5. Tab B: Platform Subscription Service**
- **UI:** 4 vertical cards (Standard, Premium, VIP, Supreme VIP) with features and prices (¥5000 - ¥80000).
- **Style:** Special gold styling for the "Supreme VIP" contact button.

**6. Tab C: Product Customization**
- **UI:** 3 Batch cards (Small, Medium, Large) that highlight based on quantity.
- **Interaction:** A slider (Range: 100 - 1000+).
- **Calculation:** `Estimated Unit Price = Base Cost * Multiplier + Fixed Fee`. The multiplier decreases as quantity increases.
- **Output:** Real-time updates of Unit Price and Total Price.

**7. Interaction & Integration**
- **Action Handler:** `handlePaymentIntent(planType, amount, details)` will log the user's choice and show a "Feature in development" toast, without making network requests.
- **App Integration:**
  - Add a `showMembership` state to `App.tsx`.
  - Add a "Membership / Upgrade" button in the Sidebar to trigger the overlay.
  - Use `TailwindCSS` via the existing CDN configuration for styling (Glassmorphism, Gradients).

### Verification
- Verify the page opens correctly from the Sidebar.
- Test the "Individual/Enterprise" switch.
- Test price updates in Individual view.
- Test all 3 tabs in Enterprise view, specifically the calculation logic in Tab A and Tab C.
- Confirm console logs and alerts appear on button clicks.
