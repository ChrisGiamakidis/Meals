import CommunityHub from "@/components/community/community-hub";
import { getCommunityPageData } from "@/lib/community";
import classes from "./page.module.css";

export const metadata = {
  title: "Food Community",
  description: "Join our active food-loving community.",
};

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const data = await getCommunityPageData();

  return (
    <>
      <header className={classes.header}>
        <p className={classes.kicker}>Community</p>
        <h1>
          One shared passion: <span className={classes.highlight}>Food</span>
        </h1>
      </header>
      <main className={classes.main}>
        <CommunityHub {...data} />
      </main>
    </>
  );
}
