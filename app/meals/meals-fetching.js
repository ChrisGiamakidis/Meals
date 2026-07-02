import MealsBrowser from "@/components/meals/meals-browser";
import { getCommunityAccessData } from "@/lib/community";

export default async function Meals({
  meals,
  page = 1,
  accessData,
  hiddenMealIds,
}) {
  const accessDataFetched = accessData ?? (await getCommunityAccessData());

  return (
    <MealsBrowser
      meals={meals}
      pageSize={6}
      currentPage={page}
      accessData={accessDataFetched}
      hiddenMealIds={hiddenMealIds}
    />
  );
}
