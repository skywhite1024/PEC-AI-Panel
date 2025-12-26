I will modify `MembershipPage.tsx` and `EnterpriseView.tsx` to conditionally render the billing cycle toggle button.

1. **Modify** **`components/Membership/EnterpriseView.tsx`**:

   * Update `EnterpriseViewProps` to include `activeTab` and `onTabChange`.

   * Remove the internal `activeTab` state.

   * Use the `activeTab` and `onTabChange` props to control the tab selection.

2. **Modify** **`components/Membership/MembershipPage.tsx`**:

   * Add a new state variable `enterpriseTab` to track the active tab of the Enterprise view.

   * Calculate `showBillingCycle` based on `viewMode` and `enterpriseTab`. The toggle should be visible if `viewMode` is 'individual' OR if (`viewMode` is 'enterprise' AND `enterpriseTab` is 'subscription').

   * Conditionally render the billing cycle `SegmentedControl` based on `showBillingCycle`.

   * Pass `enterpriseTab` and `setEnterpriseTab` to the `EnterpriseView` component.

