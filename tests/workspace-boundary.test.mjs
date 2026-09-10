import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const rootPackage = JSON.parse(await readFile(new URL("../package.json", import.meta.url)));
const adminPackage = JSON.parse(await readFile(new URL("../apps/admin/package.json", import.meta.url)));
const adminConfigModule = await import("../apps/admin/next.config.mjs");

test("기본 개발과 빌드는 공개 블로그만 대상으로 한다", () => {
  assert.equal(rootPackage.scripts.dev, "npm run dev:web");
  assert.equal(rootPackage.scripts.build, "npm run build:web");
  assert.match(rootPackage.scripts["build:web"], /@yeobaek\/web/);
});

test("관리자 앱은 로컬 개발 명령만 제공한다", () => {
  assert.match(adminPackage.scripts.dev, /next dev/);
  assert.match(adminPackage.scripts.dev, /--hostname 127\.0\.0\.1/);
  assert.equal(adminPackage.scripts.build, undefined);
  assert.equal(adminPackage.scripts.start, undefined);
});

test("관리자 앱의 프로덕션 빌드를 설정 단계에서 차단한다", () => {
  assert.throws(
    () => adminConfigModule.default("phase-production-build"),
    /로컬 개발 전용/,
  );
  assert.doesNotThrow(() => adminConfigModule.default("phase-development-server"));
});

test("관리자 소스는 브라우저 공개 환경 변수를 사용하지 않는다", async () => {
  const adminAppRoot = new URL("../apps/admin/app/", import.meta.url);
  const entries = await readdir(adminAppRoot, { recursive: true, withFileTypes: true });
  const sourceFiles = entries.filter((entry) =>
    entry.isFile()
    && /\.(?:js|jsx|mjs|ts|tsx)$/.test(entry.name),
  );

  const sources = [await readFile(new URL("../apps/admin/next.config.mjs", import.meta.url), "utf8")];
  for (const entry of sourceFiles) {
    sources.push(await readFile(new URL(`${entry.parentPath}/${entry.name}`, "file:"), "utf8"));
  }

  for (const source of sources) {
    assert.doesNotMatch(source, /NEXT_PUBLIC_/, "관리자 실행 코드에서 공개 환경 변수 접두사를 사용하고 있습니다.");
  }
});
