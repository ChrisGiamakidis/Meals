"use client";

import { logOutCommunityUser } from "@/lib/community-actions";
import classes from "./community-hub.module.css";
import EditPostForm from "./edit-post-form";
import PostActions from "./post-actions";
import Link from "next/link";

export default function CommunityHub({
  currentUser,
  posts,
  stats,
  demoUsers = [],
  demoPassword,
}) {
  const isLoggedIn = Boolean(currentUser);

  return (
    <section className={classes.communityShell}>
      <div className={classes.heroCard}>
        <div className={classes.heroText}>
          <p className={classes.kicker}>Active community</p>
          <h1>
            Talk about food, travel, techniques, and what you are cooking next.
          </h1>
          <p className={classes.lead}>
            Guests can view recipes and read community posts. Members can share
            meals, post stories, and manage their content.
          </p>
        </div>

        <div className={classes.statsGrid}>
          <div className={classes.statCard}>
            <strong>{stats.userCount}</strong>
            <span>Members</span>
          </div>
          <div className={classes.statCard}>
            <strong>{stats.postCount}</strong>
            <span>Posts</span>
          </div>
          <div className={classes.statCard}>
            <strong>{demoUsers.length}</strong>
            <span>Demo accounts</span>
          </div>
        </div>
      </div>

      <div className={classes.layout}>
        <aside className={classes.sidebar}>
          {isLoggedIn ? (
            <div className={classes.panel}>
              <p className={classes.panelLabel}>Logged in</p>
              <h3 className={classes.panelName}>{currentUser.display_name}</h3>
              <p className={classes.muted}>{currentUser.email}</p>
              <form action={logOutCommunityUser}>
                <input type="hidden" name="redirectTo" value="/community" />
                <button type="submit" className={classes.secondaryButton}>
                  Log out
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className={classes.panel}>
                <p className={classes.panelLabel}>Access</p>
                <div className={classes.accessRow}>
                  <svg
                    className={classes.accessIcon}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                  <div>
                    <p className={classes.accessTitle}>Join the community</p>
                    <p className={classes.accessSub}>
                      Log in or sign up to be able to share your own posts to
                      the feed.
                    </p>
                  </div>
                </div>
                <Link
                  href="/auth?redirectTo=/community"
                  className={classes.primaryButton}
                >
                  Log in / Sign up
                </Link>
              </div>

              {demoUsers.length > 0 && (
                <div className={classes.panel}>
                  <p className={classes.panelLabel}>Demo accounts</p>
                  <p className={classes.accessSub}>Use any demo account</p>
                  <p className={classes.accessSub}>
                    Password:{" "}
                    <span className={classes.demoPassword}>{demoPassword}</span>
                  </p>
                  <ul className={classes.demoList}>
                    {demoUsers.map((u) => (
                      <li key={u.email} className={classes.demoItem}>
                        <svg
                          className={classes.demoIcon}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                        <div>
                          <p className={classes.demoName}>{u.display_name}</p>
                          <p className={classes.demoEmail}>{u.email}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </aside>

        <div className={classes.mainColumn}>
          {isLoggedIn && (
            <EditPostForm
              currentUser={currentUser}
              post={null}
              submitLabel="Post to community"
              heading="Share your story"
              subheading="Share a dish, a memory, or a cooking tip with the community."
              placeholder="Your food story..."
            />
          )}

          <div className={classes.feedSection}>
            <p className={classes.feedLabel}>Latest posts</p>
            <div className={classes.feedList}>
              {posts.map((post) => (
                <article key={post.id} className={classes.feedCard}>
                  <div className={classes.feedCardInner}>
                    <div className={classes.feedCardContent}>
                      <div className={classes.feedMeta}>
                        <span className={classes.feedMetaIcon}>👤</span>
                        <span>{post.author_name}</span>
                        <span className={classes.feedDot}>·</span>
                        <span className={classes.feedMetaIcon}>🍽</span>
                        <span>{post.cuisine}</span>
                        <span className={classes.feedDot}>·</span>
                        <span className={classes.feedMetaIcon}>🕐</span>
                        <span>
                          {new Date(post.created_at).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "short", day: "numeric" },
                          )}
                        </span>
                      </div>
                      <h4 className={classes.feedTitle}>{post.title}</h4>
                      <p className={classes.feedBody}>{post.body}</p>
                    </div>
                    {currentUser?.id === post.user_id && !post.seed_key && (
                      <div className={classes.feedActions}>
                        <PostActions post={post} iconOnly />
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
