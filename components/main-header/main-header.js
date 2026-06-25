"use client";

import logoImg from "@/assets/logo.png";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import MainHeaderBackground from "./main-header-background";
import classes from "./main-header.module.css";
import NavLink from "./nav-link";

export default function MainHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <MainHeaderBackground />
      <header className={classes.header}>
        <Link href="/" className={classes.logo}>
          <Image src={logoImg} alt="Next Level Food Logo" priority />
          Next Level Food
        </Link>

        <button
          className={classes.menuButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className={classes.menuIcon}></span>
        </button>

        <nav className={`${classes.nav} ${isMobileMenuOpen ? classes.navOpen : ""}`}>
          <ul>
            <li onClick={() => setIsMobileMenuOpen(false)}>
              <NavLink href="/meals">Browse Meals</NavLink>
            </li>
            <li onClick={() => setIsMobileMenuOpen(false)}>
              <NavLink href="/community">Foodies Community</NavLink>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}
