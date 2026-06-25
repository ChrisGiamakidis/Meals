import { getCommunityAccessData } from "@/lib/community";
import { getMeal } from "@/lib/meals";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import classes from "./page.module.css";

async function getMealData({ params }) {
  const { mealSlug } = await params;
  const [meal, accessData] = await Promise.all([
    getMeal(mealSlug),
    getCommunityAccessData(),
  ]);

  if (!meal) {
    notFound();
  }

  return { meal, accessData };
}

export async function generateMetadata({ params }) {
  const { meal } = await getMealData({ params });
  return {
    title: meal.title,
    description: meal.summary,
  };
}

export default async function MealDetailsPage({ params }) {
  const { meal, accessData } = await getMealData({ params });
  meal.instructions = meal.instructions.trim().replaceAll("\n", "<br />");
  const isSeedMeal = (() => {
    try {
      return new URL(meal.image).pathname.startsWith("/seed/");
    } catch {
      return true;
    }
  })();
  const canEditMeal =
    Boolean(accessData.currentUser?.email && meal.creator_email) &&
    accessData.currentUser.email.toLowerCase() ===
      meal.creator_email.toLowerCase() &&
    !accessData.isGuest &&
    !isSeedMeal;

  return (
    <>
      <header className={classes.header}>
        <div className={classes.backLink}>
          <Link href="/meals">&larr; Back to Meals</Link>
          {canEditMeal ? (
            <Link
              href={`/meals/${meal.slug}/edit`}
              className={classes.editLink}
            >
              Edit Meal
            </Link>
          ) : null}
        </div>
        <div className={classes.image}>
          <Image
            src={meal.image}
            alt={meal.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="eager"
          />
        </div>
        <div className={classes.headerText}>
          <h1>{meal.title}</h1>
          <p className={classes.creator}>
            By <a href={`mailto:${meal.creator_email}`}>{meal.creator}</a>
          </p>
          <p className={classes.summary}>{meal.summary}</p>
        </div>
      </header>
      <main>
        <p
          className={classes.instructions}
          dangerouslySetInnerHTML={{
            __html: meal.instructions,
          }}
        ></p>
      </main>
    </>
  );
}
