"use client";

import { useFormStatus } from "react-dom";

export default function MealsFormSubmit({
  label = "Share Meal",
  pendingLabel = "Submitting...",
}) {
  const { pending } = useFormStatus();

  return <button disabled={pending}>{pending ? pendingLabel : label}</button>;
}
