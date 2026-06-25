import Link from "next/link";

import ImageSlideshow from "@/components/images/image-slideshow";
import { getMeals } from "@/lib/meals";
import classes from "./page.module.css";

export default async function Home() {
  const meals = await getMeals();

  return (
    <>
      <header className={classes.header}>
        <div className={classes.slideshow}>
          <ImageSlideshow meals={meals} />
        </div>
        <div>
          <div className={classes.hero}>
            <h1>NextLevel Food for NextLevel Foodies</h1>
            <p>Taste & share food from all over the world.</p>
          </div>
          <div className={classes.cta}>
            <Link href="/community">Join the Community</Link>
            <Link href="/meals">Explore Meals</Link>
          </div>
        </div>
      </header>
      <main>
        <section className={classes.section}>
          <h2>How it works</h2>
          <p>
            NextLevel Food is a platform for foodies to share their favorite
            recipes with the world. It&apos;s a place to discover new dishes,
            and to connect with other food lovers.
          </p>
        </section>

        <section className={classes.section}>
          <h2>Why NextLevel Food?</h2>
          <p>
            Join our community to share your own recipes, get inspired by
            others, and become part of a growing food-loving community.
          </p>
        </section>
      </main>
    </>
  );
}
