import MealsBrowser from "@/components/meals/meals-browser";
import { getCommunityAccessData } from "@/lib/community";
import { getMeals } from "@/lib/meals";

export default async function Meals() {
  const [meals, accessData] = await Promise.all([
    getMeals(),
    getCommunityAccessData(),
  ]);

  return <MealsBrowser meals={meals} accessData={accessData} />;
}
