import LoadingSpinner from "@/components/loading-spinner";
import {
  getCommunityAccessData,
  getCommunityDemoUsers
} from "@/lib/community";
import { Suspense } from "react";
import Meals from "./meals-fetching";
import classes from "./page.module.css";

export const metadata = {
  title: "All Meals",
  description: "Discover delicious meals shared by our community.",
};

export const dynamic = "force-dynamic";

export default async function MealsPage() {
  const [accessData, demoUsers] = await Promise.all([
    getCommunityAccessData(),
    getCommunityDemoUsers(),
  ]);

  return (
    <>
      <header className={classes.header}>
        <h1>
          Delicious meals, created{" "}
          <span className={classes.highlight}>by you</span>
        </h1>
        <p>
          Choose your favourite recipe and cook it yourself. As a guest you can view
          recipes. Become a member to share meals and delete meals on your page.
        </p>
      </header>
      <main className={classes.main}>
        <Suspense fallback={<LoadingSpinner />}>
          <Meals accessData={accessData} />
        </Suspense>
      </main>
    </>
  );
}
