"use client";

import { useActionState } from "react";

import {
  logInCommunityUser,
  signUpCommunityUser,
} from "@/lib/community-actions";
import classes from "./access-panel.module.css";
import SubmitButton from "./submit-button";

export default function AccessPanel({
  redirectTo,
  title,
  description,
  demoUsers,
  demoPassword,
}) {
  const [signupState, signupAction] = useActionState(signUpCommunityUser, {
    message: null,
  });
  const [loginState, loginAction] = useActionState(logInCommunityUser, {
    message: null,
  });

  return (
    <section className={classes.accessShell}>
      <div className={classes.intro}>
        <p className={classes.kicker}>Member access</p>
      </div>

      <div className={classes.authGrid}>
        <form action={signupAction} className={classes.panel}>
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <p className={classes.panelLabel}>Create account</p>
          <h3>Sign up</h3>
          <input name="displayName" placeholder="Display name" />
          <input name="email" type="email" placeholder="Email" />
          <input name="password" type="password" placeholder="Password" />
          {signupState?.message ? (
            <p className={classes.error}>{signupState.message}</p>
          ) : null}
          <SubmitButton>Create account</SubmitButton>
        </form>

        <form action={loginAction} className={classes.panel}>
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <p className={classes.panelLabel}>Welcome back</p>
          <h3>Log in</h3>
          <input name="email" type="email" placeholder="Email" />
          <input name="password" type="password" placeholder="Password" />
          {loginState?.message ? (
            <p className={classes.error}>{loginState.message}</p>
          ) : null}
          <SubmitButton>Log in</SubmitButton>
        </form>
      </div>

      {demoUsers?.length ? (
        <div className={classes.demoPanel}>
          <p className={classes.panelLabel}>Demo accounts</p>
          <div className={classes.demoList}>
            {demoUsers.map((user) => (
              <div key={user.email} className={classes.demoItem}>
                <strong>{user.display_name}</strong>
                <span>{user.email}</span>
              </div>
            ))}
          </div>
          <p className={classes.muted}>Password: {demoPassword}</p>
        </div>
      ) : null}
    </section>
  );
}
