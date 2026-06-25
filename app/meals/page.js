import AccessPanel from "@/components/auth/access-panel";
import LoadingSpinner from "@/components/loading-spinner";
import {
  COMMUNITY_DEFAULT_PASSWORD,
  getCommunityAccessData,
  getCommunityDemoUsers,
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
          Choose your favourite recipe and cook it yourself. It is easy and fun!
        </p>
      </header>
      <main className={classes.main}>
        {accessData.hasAccess ? (
          <Suspense fallback={<LoadingSpinner />}>
            <Meals accessData={accessData} />
          </Suspense>
        ) : (
          <AccessPanel
            redirectTo="/meals"
            title="Log in, sign up, or browse as a guest"
            description="Guests can view recipes. Members can share meals, delete meals they added, and hide seed meals from their own page."
            demoUsers={demoUsers}
            demoPassword={COMMUNITY_DEFAULT_PASSWORD}
          />
        )}
      </main>
    </>
  );
}
