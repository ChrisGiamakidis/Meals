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
      <header className={classes.header}>
        <div className={classes.backLink}>
          <Link href="/meals">&larr; Back to Meals</Link>
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
        <div
          className={classes.instructions}
          dangerouslySetInnerHTML={{ __html: formattedInstructions }}
        />
      </main>
    </>
  );
}
