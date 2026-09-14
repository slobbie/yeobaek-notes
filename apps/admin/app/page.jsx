import { POST_CATEGORIES } from "@yeobaek/content";
import { listAdminPosts } from "./lib/admin-post-repository.js";
import { toEditorDraft } from "./lib/admin-post-model.js";
import { PostEditor } from "./post-editor.jsx";

function getTodayInSeoul() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const dateParts = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

function singleValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminHome({ searchParams }) {
  const params = await searchParams;
  const selectedPostId = singleValue(params?.post);
  const savedStatus = singleValue(params?.saved);
  let posts = [];
  let connectionError = "";

  try {
    posts = await listAdminPosts();
  } catch (error) {
    console.error("[admin-posts] 목록 조회 실패", { name: error?.name });
    connectionError = "Supabase에 연결하지 못했습니다. apps/admin/.env.local 설정과 프로젝트 상태를 확인해 주세요.";
  }

  const selectedPost = selectedPostId
    ? posts.find(({ id }) => id === selectedPostId) ?? null
    : null;
  const notice = savedStatus === "published"
    ? "글을 발행했습니다. 공개 블로그에는 캐시 갱신 후 반영됩니다."
    : savedStatus === "draft"
      ? "초안을 저장했습니다."
      : "";

  return <PostEditor
    categories={POST_CATEGORIES}
    connectionError={connectionError}
    existingSlugs={posts.map(({ slug }) => slug)}
    initialDraft={toEditorDraft(selectedPost)}
    initialPost={selectedPost}
    key={selectedPost?.id ?? "new"}
    notice={notice}
    posts={posts.map(({ id, slug, status, title, updatedAt }) => ({ id, slug, status, title, updatedAt }))}
    originalSlug={selectedPost?.slug ?? ""}
    today={getTodayInSeoul()}
  />;
}
