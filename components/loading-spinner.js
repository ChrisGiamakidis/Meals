import classes from "./loading-spinner.module.css";

export default function LoadingSpinner() {
  return (
    <div className={classes.loadingContainer}>
      <div className={classes.spinner}></div>
    </div>
  );
}
