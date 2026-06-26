"use client";

import { useFormStatus } from "react-dom";
import classes from "./access-panel.module.css";

export default function SubmitButton({ children }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={classes.submitButton} disabled={pending}>
      {pending ? "Please wait..." : children}
    </button>
  );
}
