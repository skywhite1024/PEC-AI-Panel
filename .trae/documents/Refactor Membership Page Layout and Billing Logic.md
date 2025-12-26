I will refactor the Membership page layout and billing logic as requested.

### 1. Refactor `MembershipPage.tsx` (Parent Component)
- **State Management**: Lift `billingCycle` state (`monthly` | `yearly`) to this component, alongside the existing `viewMode` state.
- **UI Components**: Create a reusable `SegmentedControl` component (capsule style) to replace the hardcoded switches.
- **Header Layout**: 
  - Refactor the control area to use `flex justify-between`.
  - Place the **Individual/Enterprise** switch on the far left.
  - Place the **Monthly/Yearly** switch on the far right.
- **Props Passing**: Pass `billingCycle` down to both `IndividualView` and `EnterpriseView`.

### 2. Refactor `IndividualView.tsx`
- **Props**: Accept `billingCycle` as a prop.
- **Cleanup**: Remove the local `billingCycle` state and the old toggle switch UI.
- **Logic**: Ensure price display and `handlePaymentIntent` use the passed `billingCycle` prop.

### 3. Refactor `EnterpriseView.tsx`
- **Props**: Accept `billingCycle` as a prop.
- **Logic**: Pass `billingCycle` down to the `PlatformSubscription` component.

### 4. Refactor `PlatformSubscription.tsx`
- **Props**: Accept `billingCycle` as a prop.
- **Price Calculation**: Implement the requested logic:
  - If `yearly`: `Original Monthly Price * 12 * 0.8` (20% discount).
  - If `monthly`: `Original Monthly Price`.
- **UI Update**: Dynamically display the calculated price and the unit (`/月` or `/年`).

### 5. Verification
- Verify the new header layout aligns correctly (Left/Right).
- Confirm the new "Monthly/Yearly" switch matches the "Individual/Enterprise" style.
- Test price updates in both Individual and Enterprise (Platform Subscription) views when toggling the billing cycle.
