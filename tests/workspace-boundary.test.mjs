import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const rootPackage = JSON.parse(await readFile(new URL("../package.json", import.meta.url)));
const adminPackage = JSON.parse(await readFile(new URL("../apps/admin/package.json", import.meta.url)));

test("기본 개발과 빌드는 공개 블로그만 대상으로 한다", () => {
  assert.equal(rootPackage.scripts.dev, "npm run dev:web");
  assert.equal(rootPackage.scripts.build, "npm run build:web");
  assert.match(rootPackage.scripts["build:web"], /@yeobaek\/web/);
});

test("관리자 앱은 로컬 개발 명령만 제공한다", () => {
  assert.match(adminPackage.scripts.dev, /next dev/);
  assert.equal(adminPackage.scripts.build, undefined);
  assert.equal(adminPackage.scripts.start, undefined);
});
