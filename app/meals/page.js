import LoadingSpinner from "@/components/loading-spinner";
import { getCommunityAccessData } from "@/lib/community";
import { Suspense } from "react";
import Meals from "./meals-fetching";
import classes from "./page.module.css";

export const metadata = {
  title: "All Meals",
  description: "Discover delicious meals shared by our community.",
};

export default async function MealsPage({ searchParams }) {
  const { page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const accessData = await getCommunityAccessData();

  return (
    <>
      <header className={classes.header}>
        <h1>
          Delicious meals, created{" "}
          <span className={classes.highlight}>by you</span>
        </h1>
        <p>
          Choose your favourite recipe and cook it yourself. As a guest you can
          view recipes. Become a member to share meals and delete meals on your
          page.
        </p>
      </header>
      <main className={classes.main}>
        <Suspense fallback={<LoadingSpinner />}>
          <Meals accessData={accessData} page={currentPage} />
        </Suspense>
      </main>
    </>
  );
}
