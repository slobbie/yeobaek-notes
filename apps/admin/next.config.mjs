import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PHASE_PRODUCTION_BUILD } from "next/constants.js";

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const localOnlyConfig = {
  turbopack: {
    root: workspaceRoot,
  },
  outputFileTracingRoot: workspaceRoot,
};

export default function getAdminConfig(phase) {
  if (phase === PHASE_PRODUCTION_BUILD) {
    throw new Error("관리자 앱은 로컬 개발 전용이므로 프로덕션 빌드를 지원하지 않습니다.");
  }

  return localOnlyConfig;
}
