import { useFormStatus } from "react-dom";
import classes from "./community-hub.module.css";

export default function SubmitButton({ children, pendingLabel }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={classes.submitButton} disabled={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}
