import Link from "next/link";
import AccessPanel from "@/components/auth/access-panel";
import ShareMealForm from "@/components/meals/share-meal-form";
import {
  COMMUNITY_DEFAULT_PASSWORD,
  getCommunityAccessData,
  getCommunityDemoUsers,
} from "@/lib/community";
import classes from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function ShareMealPage() {
  const [accessData, demoUsers] = await Promise.all([
    getCommunityAccessData(),
    getCommunityDemoUsers(),
  ]);

  return (
    <>
      <header className={classes.header}>
        <div className={classes.backLink}>
          <Link href="/meals" className={classes.backLinkLink}>
            &larr; Back to Meals
          </Link>
        </div>
        <h1>
          Share your <span className={classes.highlight}>favourite meal</span>
        </h1>
        <p>Or any other meal you feel needs sharing!</p>
      </header>
      <main className={classes.main}>
        {accessData.currentUser ? (
          <ShareMealForm currentUser={accessData.currentUser} />
        ) : (
          <AccessPanel
            redirectTo="/meals/share"
            title="Log in or sign up to share a meal"
            description="Guests can browse recipes. Members can add recipes and manage the meals they contributed."
            demoUsers={demoUsers}
            demoPassword={COMMUNITY_DEFAULT_PASSWORD}
          />
        )}
      </main>
    </>
  );
}
