"use client";

import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";

import { DeletedMealsContext } from "@/store/deleted-meals-context";
import classes from "./image-slideshow.module.css";

export default function ImageSlideshow({ meals }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { hiddenMealIds, isLoaded } = useContext(DeletedMealsContext);

  const visibleImages = meals
    .filter((meal) => !hiddenMealIds.includes(String(meal.id)))
    .map((meal) => ({
      src: meal.image,
      alt: meal.title,
    }));

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (visibleImages.length === 0) {
      setCurrentImageIndex(0);
      return;
    }

    setCurrentImageIndex((currentIndex) =>
      currentIndex >= visibleImages.length ? 0 : currentIndex,
    );

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex < visibleImages.length - 1 ? prevIndex + 1 : 0,
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [isLoaded, visibleImages.length]);

  if (!isLoaded) {
    return <div className={classes.slideshow} aria-busy="true" />;
  }

  if (visibleImages.length === 0) {
    return (
      <div className={classes.slideshow}>
        <div className={classes.noMeals}>
          <p>No meals available yet. Please add yours.</p>
          <p className={classes.cta}>
            <Link href="/meals/share">Add Meal</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.slideshow}>
      {visibleImages.map((image, index) => (
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          className={index === currentImageIndex ? classes.active : ""}
          width={800}
          height={600}
          loading="eager"
        />
      ))}
    </div>
  );
}
