import Meals from "./meals-fetching";
import classes from "./page.module.css";
import { Suspense } from "react";
import LoadingSpinner from "@/components/loading-spinner";

export const metadata = {
  title: "All Meals",
  description: "Discover delicious meals shared by our community.",
};

export default function MealsPage() {
  return (
    <>
      <header className={classes.header}>
        <h1>
          Delicious meals, created{" "}
          <span className={classes.highlight}>by you</span>
        </h1>
        <p>
          Choose your favourite recipe and cook it yourself. It is easy and fun!
        </p>
      </header>
      <main className={classes.main}>
        <Suspense
          fallback={<LoadingSpinner />}
        >
          <Meals />
        </Suspense>
      </main>
    </>
  );
}
