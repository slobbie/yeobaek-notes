"use server";

import { checkPostForPublication } from "@yeobaek/content";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAdminPost,
  listAdminPosts,
  saveAdminPost,
} from "./lib/admin-post-repository.js";

function getTodayInSeoul() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

async function assertLocalRequest() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
  if (!/^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host)) {
    throw new Error("관리자 저장 기능은 로컬에서만 사용할 수 있습니다.");
  }
}

function parsePayload(formData) {
  const rawPayload = formData.get("payload");
  if (typeof rawPayload !== "string") throw new TypeError("저장할 글을 확인하지 못했습니다.");
  try {
    return JSON.parse(rawPayload);
  } catch {
    throw new TypeError("저장할 글 형식이 올바르지 않습니다.");
  }
}

export async function savePostAction(_previousState, formData) {
  let destination;
  const submittedPayload = formData.get("payload");

  try {
    await assertLocalRequest();
    const draft = parsePayload(formData);
    const intent = formData.get("intent");
    if (intent !== "draft" && intent !== "publish") {
      throw new TypeError("저장 방식을 확인하지 못했습니다.");
    }
    const rawPostId = formData.get("postId");
    if (typeof rawPostId !== "string") throw new TypeError("글 ID 형식이 올바르지 않습니다.");
    const postId = rawPostId.trim() || null;
    if (postId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(postId)) {
      throw new TypeError("글 ID 형식이 올바르지 않습니다.");
    }
    const posts = await listAdminPosts();
    const currentPost = postId ? await getAdminPost(postId) : null;

    if (postId && !currentPost) throw new Error("수정할 글을 찾지 못했습니다.");

    const targetStatus = intent === "publish" || currentPost?.status === "published"
      ? "published"
      : "draft";

    if (targetStatus === "published") {
      const publicationCheck = checkPostForPublication(draft, {
        existingSlugs: posts.map(({ slug }) => slug),
        originalSlug: currentPost?.slug ?? "",
        today: getTodayInSeoul(),
      });
      const firstError = publicationCheck.checks.find(({ status }) => status === "error");
      if (firstError) {
        return {
          status: "error",
          message: firstError.message,
          payload: typeof submittedPayload === "string" ? submittedPayload : "",
        };
      }
    }

    const savedPost = await saveAdminPost({ postId, draft, status: targetStatus });
    destination = `/?post=${encodeURIComponent(savedPost.id)}&saved=${targetStatus}`;
  } catch (error) {
    const message = error instanceof TypeError || (error instanceof Error && error.message.includes("관리자"))
      ? error.message
      : error instanceof Error && [
        "수정할 글을 찾지 못했습니다.",
        "이미 사용 중인 글 주소입니다. 다른 주소를 입력해 주세요.",
        "글을 저장하지 못했습니다. 입력 내용을 유지했으니 잠시 후 다시 시도해 주세요.",
        "Supabase에 연결하지 못했습니다. 관리자 환경 변수와 로컬 실행 상태를 확인해 주세요.",
      ].includes(error.message)
        ? error.message
        : "글을 저장하지 못했습니다. 입력 내용을 유지했으니 잠시 후 다시 시도해 주세요.";
    return {
      status: "error",
      message,
      payload: typeof submittedPayload === "string" ? submittedPayload : "",
    };
  }

  revalidatePath("/");
  redirect(destination);
}
