import assert from "node:assert/strict";
import test from "node:test";
import { splitEditorTags } from "../apps/admin/app/post-editor-model.js";

test("쉼표로 입력한 태그의 공백과 중복을 정리한다", () => {
  assert.deepEqual(splitEditorTags("AI, 도구, AI,  일 "), ["AI", "도구", "일"]);
});
