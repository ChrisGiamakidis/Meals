"use client";

import { logOutCommunityUser } from "@/lib/community-actions";
import classes from "./community-hub.module.css";
import EditPostForm from "./edit-post-form";
import PostActions from "./post-actions";

export default function CommunityHub({
  currentUser,
  isGuest,
  posts,
  stats,
  demoUsers = [],
}) {
  return (
    <section className={classes.communityShell}>
      <div className={classes.heroCard}>
        <div>
          <p className={classes.kicker}>Active community</p>
          <h2>
            Talk about food, travel, techniques, and what you are cooking next.
          </h2>
          <p className={classes.lead}>
            Join as a guest to browse the feed, or create an account to post
            your own food experiences.
          </p>
        </div>

        <div className={classes.statsGrid}>
          <div>
            <strong>{stats.userCount}</strong>
            <span>Members</span>
          </div>
          <div>
            <strong>{stats.postCount}</strong>
            <span>Posts</span>
          </div>
          <div>
            <strong>{demoUsers.length}</strong>
            <span>Demo accounts</span>
          </div>
        </div>
      </div>

      <div className={classes.layout}>
        <aside className={classes.sidebar}>
          {currentUser ? (
            <div className={classes.panel}>
              <p className={classes.panelLabel}>Logged in</p>
              <h3>{currentUser.display_name}</h3>
              <p className={classes.muted}>{currentUser.email}</p>
              <form action={logOutCommunityUser}>
                <input type="hidden" name="redirectTo" value="/community" />
                <button type="submit" className={classes.secondaryButton}>
                  Log out
                </button>
              </form>
            </div>
          ) : (
            <div className={classes.panel}>
              <p className={classes.panelLabel}>Guest mode</p>
              <h3>Browse only</h3>
              <p className={classes.muted}>
                Guests can explore the feed, but they need an account to post.
              </p>
              <form action={logOutCommunityUser}>
                <input type="hidden" name="redirectTo" value="/community" />
                <button type="submit" className={classes.secondaryButton}>
                  Sign in instead
                </button>
              </form>
            </div>
          )}
        </aside>

        <div className={classes.mainColumn}>
          {isGuest ? null : (
            <EditPostForm
              currentUser={currentUser}
              post={null}
              submitLabel="Publish post"
              heading="Share a post to the feed"
              placeholder="Tell the community about your food experience"
            />
          )}

          <div className={classes.feedSection}>
            <div className={classes.feedHeader}>
              <p className={classes.panelLabel}>Community feed</p>
              <h3>Latest stories from the community</h3>
            </div>

            <div className={classes.feedList}>
              {posts.map((post) => (
                <article key={post.id} className={classes.feedCard}>
                  <div className={classes.feedMeta}>
                    <span className={classes.feedTag}>{post.cuisine}</span>
                    <span className={classes.feedAuthor}>
                      by {post.author_name}
                    </span>
                  </div>
                  <h4>{post.title}</h4>
                  <p>{post.body}</p>
                  {currentUser?.id === post.user_id && !post.seed_key ? (
                    <PostActions post={post} />
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
