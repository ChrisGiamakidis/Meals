import { getCommunityAccessData } from "@/lib/community";
import MainHeader from "./main-header";

export default async function MainHeaderWrapper() {
  const { currentUser } = await getCommunityAccessData();
  return <MainHeader isLoggedIn={Boolean(currentUser)} />;
}
