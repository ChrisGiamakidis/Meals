"use client";

import { useEffect, useRef, useState } from "react";
import classes from "./meal-hero.module.css";

const DEFAULT_HERO_HEIGHT = 480;

export default function MealHero({
  title,
  creator,
  creatorEmail,
  summary,
  imageSrc,
}) {
  const heroRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [heroHeight, setHeroHeight] = useState(DEFAULT_HERO_HEIGHT);

  useEffect(() => {
    function onScroll() {
      setScrollY(window.scrollY);
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const heroElement = heroRef.current;

    if (!heroElement) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      setHeroHeight(entry.contentRect.height || DEFAULT_HERO_HEIGHT);
    });

    resizeObserver.observe(heroElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const progress = Math.min(scrollY / heroHeight, 1);
  const textTranslateY = progress * -80;
  const overlayOpacity = 0.95 - progress * 0.3;

  return (
    <div className={classes.hero} ref={heroRef}>
      <div
        className={classes.imageBg}
        style={{
          backgroundImage: `url(${imageSrc})`,
          transform: `translateY(${scrollY * 0.35}px)`,
        }}
      />
      <div className={classes.overlay} style={{ opacity: overlayOpacity }} />
      <div
        className={classes.textBlock}
        style={{ transform: `translateY(${textTranslateY}px)` }}
      >
        <h1 className={classes.title}>{title}</h1>
        <p className={classes.creator}>
          By{" "}
          <a href={`mailto:${creatorEmail}`} className={classes.creatorLink}>
            {creator}
          </a>
        </p>
        <p className={classes.summary}>{summary}</p>
      </div>
    </div>
  );
}
