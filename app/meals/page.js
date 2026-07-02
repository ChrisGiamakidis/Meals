import LoadingSpinner from "@/components/loading-spinner";
import { getCommunityAccessData } from "@/lib/community";
import {
  decodeDeletedMealsSnapshot,
  getDeletedMealsCookieName,
  parseDeletedMealIds,
} from "@/lib/deleted-meals";
import { getMeals } from "@/lib/meals";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
  const cookieStore = await cookies();
  const accountId = accessData.currentUser?.id ?? "guest";
  const hiddenMealsSnapshot = cookieStore.get(
    getDeletedMealsCookieName(accountId),
  )?.value;
  const hiddenMealIds = parseDeletedMealIds(
    decodeDeletedMealsSnapshot(hiddenMealsSnapshot),
  );

  const meals = await getMeals();
  const visibleMealCount = meals.filter(
    (meal) => !hiddenMealIds.includes(String(meal.id)),
  ).length;
  const totalPages = Math.max(1, Math.ceil(visibleMealCount / 6));

  if (currentPage > totalPages) {
    redirect(totalPages > 1 ? `/meals?page=${totalPages}` : "/meals");
  }

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
          <Meals
            meals={meals}
            accessData={accessData}
            page={currentPage}
            hiddenMealIds={hiddenMealIds}
          />
        </Suspense>
      </main>
    </>
  );
}
