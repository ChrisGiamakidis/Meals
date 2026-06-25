import AccessPanel from "@/components/auth/access-panel";
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
        <p>
          Join as a guest to browse. Create an account to post your food
          experiences, cuisines, and discoveries.
        </p>
      </header>
      <main className={classes.main}>
        {data.hasAccess ? (
          <CommunityHub {...data} />
        ) : (
          <AccessPanel
            redirectTo="/community"
            title="Log in, sign up, or join as a guest"
            description="Guests can read the community feed. Members can publish posts and delete the posts they added."
            demoUsers={data.demoUsers}
            demoPassword={data.demoPassword}
          />
        )}
      </main>
    </>
  );
}
