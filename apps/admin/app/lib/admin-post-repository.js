import "server-only";

import { createAdminPostDataApi } from "./admin-post-data-api.js";

function requireEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`관리자 콘텐츠 저장소 환경 변수 ${name}이 설정되지 않았습니다.`);
  }
  return value;
}

function getRepository() {
  return createAdminPostDataApi({
    baseUrl: requireEnvironment("SUPABASE_URL"),
    serviceRoleKey: requireEnvironment("SUPABASE_SERVICE_ROLE_KEY"),
  });
}

export async function listAdminPosts() {
  return getRepository().listPosts();
}

export async function getAdminPost(postId) {
  return getRepository().getPost(postId);
}

export async function saveAdminPost(input) {
  return getRepository().savePost(input);
}
