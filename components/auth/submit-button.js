import classes from "./access-panel.module.css";

export default function SubmitButton({ children }) {
  return (
    <button type="submit" className={classes.submitButton}>
      {children}
    </button>
  );
}
