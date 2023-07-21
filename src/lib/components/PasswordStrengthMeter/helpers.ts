import type { PopupSettings } from "@skeletonlabs/skeleton";

export const passwordPopupFocusBlur: PopupSettings = {
  event: "focus-blur",
  target: "popupFocusBlur",
  placement: "top",
};

export const passwordStrengthLevels = ["Super weak", "Very weak", "Weak", "Strong", "Very strong"];
export const passwordStrengthColorLevels = [
  "text-red-600",
  "text-red-500",
  "text-orange-400",
  "text-green-300",
  "text-green-500",
];
