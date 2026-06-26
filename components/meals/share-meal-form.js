"use client";

import { useActionState } from "react";

import classes from "@/app/meals/share/page.module.css";
import { shareMeal, updateMeal } from "@/lib/actions";
import ImagePicker from "./image-picker";
import MealsFormSubmit from "./meals-form-submit";

export default function ShareMealForm({
  currentUser,
  meal = null,
  submitLabel = "Share Meal",
  pendingLabel = "Submitting...",
}) {
  const action = meal ? updateMeal : shareMeal;
  const [state, formAction] = useActionState(action, { message: null });
  const isEditing = Boolean(meal);

  return (
    <form className={classes.form} action={formAction}>
      <div className={classes.accountBox}>
        <span>{isEditing ? "Editing as" : "Sharing as"}</span>
        <strong>{currentUser.display_name}</strong>
        <small>{currentUser.email}</small>
      </div>

      {isEditing ? <input type="hidden" name="mealId" value={meal.id} /> : null}

      <p>
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={meal?.title ?? ""}
          required
        />
      </p>
      <p>
        <label htmlFor="summary">Short Summary</label>
        <input
          type="text"
          id="summary"
          name="summary"
          defaultValue={meal?.summary ?? ""}
          required
        />
      </p>
      <p>
        <label htmlFor="instructions">Instructions</label>
        <textarea
          id="instructions"
          name="instructions"
          rows="6"
          defaultValue={meal?.instructions ?? ""}
          required
        />
      </p>
      <ImagePicker
        label={isEditing ? "Replace image" : "Your Image"}
        name="image"
        required={!isEditing}
        initialImage={meal?.image ?? null}
      />
      {state.message ? <p>{state.message}</p> : null}
      <p className={classes.actions}>
        <MealsFormSubmit label={submitLabel} pendingLabel={pendingLabel} />
      </p>
    </form>
  );
}
