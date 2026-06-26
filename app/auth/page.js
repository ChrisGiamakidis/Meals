import AccessPanel from "@/components/auth/access-panel";
import {
  COMMUNITY_DEFAULT_PASSWORD,
  getCommunityAccessData,
  getCommunityDemoUsers,
} from "@/lib/community";
import { redirect } from "next/navigation";
import classes from "./page.module.css";

export const metadata = {
  title: "Sign in or create an account",
  description: "Log in, sign up, or continue as a guest.",
};

export default async function AuthPage({ searchParams }) {
  const { redirectTo = "/" } = await searchParams;
  const [accessData, demoUsers] = await Promise.all([
    getCommunityAccessData(),
    getCommunityDemoUsers(),
  ]);

  if (accessData.currentUser) {
    redirect(redirectTo);
  }

  return (
    <>
      <main className={classes.main}>
        <AccessPanel
          redirectTo={redirectTo}
          title="Log in or sign up"
          description="Guests can view recipes and read community posts. Members can share meals, post stories, and manage their content."
          demoUsers={demoUsers}
          demoPassword={COMMUNITY_DEFAULT_PASSWORD}
        />
      </main>
    </>
  );
}
