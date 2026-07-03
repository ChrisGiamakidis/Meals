import Link from "next/link";
import MealSearchBar from "./meal-search-bar";
import classes from "./meals-toolbar.module.css";

export default function MealsToolbar({
  currentUser,
  hiddenMealCount,
  isRestoringMeals,
  searchTerm,
  onSearchChange,
  onRestoreMeals,
}) {
 return (
   <div className={classes.toolbar}>
     <div className={classes.controls}>
       <MealSearchBar value={searchTerm} onChange={onSearchChange} />

       {currentUser && hiddenMealCount > 0 ? (
         <button
           type="button"
           className={classes.restoreButton}
           disabled={isRestoringMeals}
           onClick={onRestoreMeals}
         >
           Restore Hidden Meals
         </button>
       ) : null}

       {currentUser ? (
         <Link href="/meals/share" className={classes.shareButton}>
           Share Your Favourite Recipe
         </Link>
       ) : (
         <Link href="/auth?redirectTo=/meals" className={classes.loginButton}>
           Log in / Sign up
         </Link>
       )}
     </div>
   </div>
 );  
}
