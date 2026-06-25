import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import ShareMealForm from "@/components/meals/share-meal-form";
import { updateMeal } from "@/lib/actions";
import { getCommunityAccessData } from "@/lib/community";
import { getMeal } from "@/lib/meals";
import classes from "../../share/page.module.css";

async function getEditableMeal({ params }) {
  const { mealSlug } = await params;
  const [meal, accessData] = await Promise.all([
    getMeal(mealSlug),
    getCommunityAccessData(),
  ]);

  if (!meal) {
    notFound();
  }

  if (!accessData.currentUser || accessData.isGuest) {
    redirect(`/meals/${mealSlug}`);
  }

  const isSeedMeal = (() => {
    try {
      return new URL(meal.image).pathname.startsWith("/seed/");
    } catch {
      return true;
    }
  })();

  const ownsMeal =
    accessData.currentUser.email.toLowerCase() ===
    meal.creator_email.toLowerCase();

  if (!ownsMeal || isSeedMeal) {
    redirect(`/meals/${mealSlug}`);
  }

  return { meal, currentUser: accessData.currentUser };
}

export async function generateMetadata({ params }) {
  const { meal } = await getEditableMeal({ params });

  return {
    title: `Edit ${meal.title}`,
    description: `Update ${meal.title}`,
  };
}

export default async function EditMealPage({ params }) {
  const { meal, currentUser } = await getEditableMeal({ params });

  return (
    <>
      <header className={classes.header}>
        <div className={classes.backLink}>
          <Link href={`/meals/${meal.slug}`} className={classes.backLinkLink}>
            &larr; Back to Meal
          </Link>
        </div>
        <h1>
          Edit <span className={classes.highlight}>{meal.title}</span>
        </h1>
        <p>
          Update the recipe details or replace the image without reposting from
          scratch.
        </p>
      </header>
      <main className={classes.main}>
        <ShareMealForm
          currentUser={currentUser}
          meal={meal}
          action={updateMeal}
          submitLabel="Save Changes"
          pendingLabel="Saving..."
        />
      </main>
    </>
  );
}
