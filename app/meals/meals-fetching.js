import { getMeals } from "@/lib/meals";
import MealsBrowser from "@/components/meals/meals-browser";

export default async function Meals() {
  const meals = await getMeals();

  return <MealsBrowser meals={meals} />;
}
