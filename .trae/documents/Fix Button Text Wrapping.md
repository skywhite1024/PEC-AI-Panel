I will modify `components/Membership/MembershipPage.tsx` to ensure the text in the buttons stays on a single line.

1.  **Prevent Text Wrapping**: Add the `whitespace-nowrap` class to the button element within the `SegmentedControl` component. This forces the text to stay on one line.
2.  **Increase Container Width**: Update the `min-w` (minimum width) values for the `SegmentedControl` instances to ensure there is enough space for the longer text.
    *   Change `min-w-[280px]` to `min-w-[360px]` for the "Individual/Enterprise" toggle.
    *   Change `min-w-[240px]` to `min-w-[320px]` for the "Monthly/Yearly" toggle.

These changes will ensure the Chinese and English text appears on the same line without wrapping or being cramped.