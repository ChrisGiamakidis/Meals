import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import classes from "../../../page.module.css";
import { getCommunityAccessData, getCommunityPostById } from "@/lib/community";
import EditPostForm from "@/components/community/edit-post-form";

async function getEditablePost(postId) {
  const [post, accessData] = await Promise.all([
    getCommunityPostById(Number(postId)),
    getCommunityAccessData(),
  ]);

  if (!post) {
    notFound();
  }

  if (!accessData.currentUser || accessData.isGuest) {
    redirect("/community");
  }

  if (accessData.currentUser.id !== post.user_id) {
    redirect("/community");
  }

  return { post, currentUser: accessData.currentUser };
}

export async function generateMetadata({ params }) {
  const { postId } = await params;
  const { post } = await getEditablePost(postId);
  return {
    title: `Edit ${post.title}`,
    description: `Update ${post.title}`,
  };
}

export default async function EditCommunityPostPage({ params }) {
  const { postId } = await params;
  const { post, currentUser } = await getEditablePost(postId);

  return (
    <>
      <header className={classes.header}>
        <div className={classes.backLink}>
          <Link href="/community" className={classes.backLinkLink}>
            &larr; Back to Community
          </Link>
        </div>
        <h1>
          Edit <span className={classes.highlight}>{post.title}</span>
        </h1>
        <p>
          Revise your post and publish the updated version without deleting it
          first.
        </p>
      </header>
      <main className={classes.main}>
        <EditPostForm
          currentUser={currentUser}
          post={post}
          submitLabel="Apply Changes"
          heading="Edit your post"
          placeholder="Revise your food story"
        />
      </main>
    </>
  );
}
