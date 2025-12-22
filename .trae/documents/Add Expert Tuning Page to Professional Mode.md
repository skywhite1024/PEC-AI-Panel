I will add the "Expert Tuning" (算法导出) page to the Professional Mode.

**Implementation Plan:**

1.  **Create `components/ExpertTuningPanel.tsx`**:

    - This will be a new component containing the "Expert Tuning" UI.
    - **Zone A (Core Parameters)**: A dense grid of inputs using `ProInput`, categorized into Basic Control, Advanced Algorithms, and Closed Loop Parameters. I will add a simulated "editing" animation to random inputs to create the requested "live" feel.
    - **Zone B (Real-time Evaluation)**: A dashboard displaying key metrics (Efficiency, Tj Fluctuation, Switching Loss, THD) with a "digital instrument" look.
    - **Zone C (Bottom Bar)**: A fixed bottom bar with actions: Generate Code, Export .HEX, and Flash/Burn (with USB icon).
    - **Charts**: A dynamic SVG waveform component to visualize simulated real-time data (e.g., three-phase current).

2.  **Modify `components/ProfessionalPanel.tsx`**:

    - Update the `activeTab` state to include an `'expert'` mode.
    - Add the "算法导出" button in the tab navigation bar next to "实时计算".
    - Render the `ExpertTuningPanel` when the "算法导出" tab is active.

3.  **Styles & Theming**:
    - Ensure the new panel matches the existing Deep Blue/Grey White theme.
    - Use Tailwind CSS for layout (grids, spacing) and responsiveness.
    - Add specific animations for the "active" input simulation.

This approach keeps the new complex UI isolated in its own component while seamlessly integrating it into the existing `ProfessionalPanel`.
