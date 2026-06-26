import { getCommunityAccessData } from "@/lib/community";
import { getMeal } from "@/lib/meals";
import Link from "next/link";
import { notFound } from "next/navigation";

import classes from "./page.module.css";
import MealHero from "@/components/meals/meal-hero";

async function getMealData({ params }) {
  const { mealSlug } = await params;
  const [meal, accessData] = await Promise.all([
    getMeal(mealSlug),
    getCommunityAccessData(),
  ]);
  if (!meal) notFound();
  return { meal, accessData };
}

export async function generateMetadata({ params }) {
  const { meal } = await getMealData({ params });
  return { title: meal.title, description: meal.summary };
}

function formatInstructions(raw) {
  return raw
    .trim()
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (/^\d+\./.test(trimmed)) {
        return `<p class="step-title"><strong>${trimmed}</strong></p>`;
      }
      return `<p class="step-body">${trimmed}</p>`;
    })
    .join("");
}

export default async function MealDetailsPage({ params }) {
  const { meal } = await getMealData({ params });
  const formattedInstructions = formatInstructions(meal.instructions);

  return (
    <>
      <div className={classes.backLink}>
        <Link href="/meals">&larr; Back to Meals</Link>
      </div>

      <MealHero
        title={meal.title}
        creator={meal.creator}
        creatorEmail={meal.creator_email}
        summary={meal.summary}
        imageSrc={meal.image}
      />

      <main>
        <div
          className={classes.instructions}
          dangerouslySetInnerHTML={{ __html: formattedInstructions }}
        />
      </main>
    </>
  );
}
