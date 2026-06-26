"use client";

import logoImg from "@/assets/logo.png";
import { logOutCommunityUser } from "@/lib/community-actions";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import classes from "./main-header.module.css";
import NavLink from "./nav-link";

export default function MainHeader({ isLoggedIn }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setVisible(true);
      } else {
        setVisible(false);
        setIsMobileMenuOpen(false);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`${classes.header} ${visible ? classes.visible : classes.hidden}`}
    >
      <Link href="/" className={classes.logo}>
        <Image
          src={logoImg}
          alt="Next Level Food Logo"
          priority
          width={80}
          height={80}
        />
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

      <nav
        className={`${classes.nav} ${isMobileMenuOpen ? classes.navOpen : ""}`}
      >
        <ul>
          <li onClick={() => setIsMobileMenuOpen(false)}>
            <NavLink href="/meals">Browse Meals</NavLink>
          </li>
          <li onClick={() => setIsMobileMenuOpen(false)}>
            <NavLink href="/community">Foodies Community</NavLink>
          </li>
          <li onClick={() => setIsMobileMenuOpen(false)}>
            {isLoggedIn ? (
              <form action={logOutCommunityUser} className={classes.logoutForm}>
                <button type="submit" className={classes.authButton}>
                  Log out
                </button>
              </form>
            ) : (
              <Link href="/auth" className={classes.authButton}>
                Log in
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}
