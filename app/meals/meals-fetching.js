import MealsBrowser from "@/components/meals/meals-browser";
import { getCommunityAccessData } from "@/lib/community";
import { getPaginatedMeals } from "@/lib/meals";

export default async function Meals({ page = 1, accessData }) {
  const [paginatedData, accessDataFetched] = await Promise.all([
    getPaginatedMeals({ page, limit: 6 }),
    accessData ? Promise.resolve(accessData) : getCommunityAccessData(),
  ]);

  return (
    <MealsBrowser
      meals={paginatedData.meals}
      totalPages={paginatedData.totalPages}
      currentPage={paginatedData.page}
      accessData={accessDataFetched}
    />
  );
}
