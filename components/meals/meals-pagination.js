import Link from "next/link";
import classes from "./meals-pagination.module.css";

export default function MealsPagination({ currentPage, totalPages }) { 
  if (totalPages <= 1) {
    return null;
  }
  return (
    <nav className={classes.pagination} aria-label="Meals pagination">
      {currentPage > 1 ? (
        <Link
          href={`/meals?page=${currentPage - 1}`}
          className={classes.pageButton}
        >
          ← Previous
        </Link>
      ) : (
        <span />
      )}

      <span className={classes.pageInfo}>
        {currentPage} / {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link
          href={`/meals?page=${currentPage + 1}`}
          className={classes.pageButton}
        >
          Next →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}