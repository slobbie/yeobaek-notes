const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RAW_HTML_PATTERN = /<\/?[a-z][^>]*>/i;
const EMPTY_IMAGE_ALT_PATTERN = /!\[\s*\]\([^)]*\)/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EVIDENCE_CATEGORIES = new Set(["경제", "기술", "리뷰"]);
const BASIS_PATTERN =
  /(?:\d{4}년|\d{1,2}월|기준|공식 (?:문서|자료)|직접 (?:사용|확인)|사용한 경험|비교 조건|조사 결과)/;

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function createCheck(id, label, status, message, fieldId) {
  return {
    id,
    label,
    status,
    message,
    ...(fieldId ? { fieldId } : {}),
  };
}

function hasAnySourceValue(source) {
  return [source?.title, source?.publisher, source?.url, source?.accessedAt].some(clean);
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function checkRequiredFields(draft) {
  const requiredFields = [
    ["제목", draft.title, "post-title"],
    ["요약", draft.excerpt, "post-excerpt"],
    ["분야", draft.category, "post-category"],
  ];
  const missingFields = requiredFields.filter(([, value]) => !clean(value));

  if (missingFields.length === 0) {
    return createCheck("required-fields", "기본 정보", "passed", "제목, 요약, 분야를 입력했습니다.");
  }

  return createCheck(
    "required-fields",
    "기본 정보",
    "error",
    `${missingFields.map(([label]) => label).join(", ")}을 입력해 주세요.`,
    missingFields[0][2],
  );
}

function checkSlugFormat(draft) {
  const slug = clean(draft.slug);

  if (SLUG_PATTERN.test(slug)) {
    return createCheck("slug-format", "주소 형식", "passed", "영문 소문자와 숫자, 하이픈으로 작성했습니다.");
  }

  return createCheck(
    "slug-format",
    "주소 형식",
    "error",
    "영문 소문자와 숫자를 하이픈으로 연결해 주세요.",
    "post-slug",
  );
}

function checkSlugDuplicate(draft, existingSlugs, originalSlug) {
  const slug = clean(draft.slug);
  const hasDuplicate = existingSlugs.some(
    (existingSlug) => existingSlug === slug && existingSlug !== originalSlug,
  );

  if (!hasDuplicate) {
    return createCheck("slug-duplicate", "주소 중복", "passed", "같은 주소를 사용하는 글이 없습니다.");
  }

  return createCheck(
    "slug-duplicate",
    "주소 중복",
    "error",
    "이미 사용 중인 주소입니다. 다른 주소를 입력해 주세요.",
    "post-slug",
  );
}

function checkBody(draft) {
  const bodyMarkdown = clean(draft.bodyMarkdown);

  if (!bodyMarkdown) {
    return createCheck("body", "본문", "error", "본문을 작성해 주세요.", "post-body");
  }

  if (RAW_HTML_PATTERN.test(bodyMarkdown)) {
    return createCheck(
      "body",
      "본문",
      "error",
      "HTML 태그 대신 Markdown 문법을 사용해 주세요.",
      "post-body",
    );
  }

  return createCheck("body", "본문", "passed", "Markdown 본문을 확인했습니다.");
}

function checkSources(draft, today) {
  const sources = Array.isArray(draft.sources) ? draft.sources : [];
  const meaningfulSources = sources
    .map((source, index) => ({ source, index }))
    .filter(({ source }) => hasAnySourceValue(source));

  for (const { source, index } of meaningfulSources) {
    const sourceFields = [
      ["자료명", source.title, `source-title-${index}`],
      ["발행처", source.publisher, `source-publisher-${index}`],
      ["주소", source.url, `source-url-${index}`],
      ["확인한 날", source.accessedAt, `source-date-${index}`],
    ];
    const missingFields = sourceFields.filter(([, value]) => !clean(value));

    if (missingFields.length > 0) {
      return createCheck(
        "sources",
        "출처",
        "error",
        `${index + 1}번째 출처의 ${missingFields.map(([label]) => label).join(", ")}을 입력해 주세요.`,
        missingFields[0][2],
      );
    }

    if (!isHttpUrl(clean(source.url))) {
      return createCheck(
        "sources",
        "출처",
        "error",
        `${index + 1}번째 출처 주소를 http:// 또는 https://로 시작해 주세요.`,
        `source-url-${index}`,
      );
    }

    const accessedAt = clean(source.accessedAt);

    if (!ISO_DATE_PATTERN.test(accessedAt) || accessedAt > today) {
      return createCheck(
        "sources",
        "출처",
        "error",
        `${index + 1}번째 출처를 확인한 날은 오늘 또는 이전 날짜로 입력해 주세요.`,
        `source-date-${index}`,
      );
    }
  }

  if (meaningfulSources.length === 0) {
    return createCheck("sources", "출처", "passed", "등록한 출처가 없습니다.");
  }

  return createCheck("sources", "출처", "passed", `출처 ${meaningfulSources.length}개를 확인했습니다.`);
}

function checkEvidence(draft) {
  if (!EVIDENCE_CATEGORIES.has(clean(draft.category))) {
    return createCheck("evidence", "근거", "passed", "이 글에는 별도 근거 확인이 필요하지 않습니다.");
  }

  const hasSource = (Array.isArray(draft.sources) ? draft.sources : []).some(hasAnySourceValue);
  const hasBasis = BASIS_PATTERN.test(clean(draft.bodyMarkdown));

  if (hasSource || hasBasis) {
    return createCheck("evidence", "근거", "passed", "출처 또는 판단 기준을 확인했습니다.");
  }

  return createCheck(
    "evidence",
    "근거",
    "warning",
    "자료의 시점이나 사용·비교 조건을 본문에 적었는지 확인해 주세요.",
    "post-body",
  );
}

function checkSeoTitle(draft) {
  const seoTitle = clean(draft.seoTitle);

  if (!seoTitle) {
    return createCheck("seo-title", "검색 제목", "error", "검색 결과에 표시할 제목을 입력해 주세요.", "seo-title");
  }

  if (seoTitle.length > 60) {
    return createCheck(
      "seo-title",
      "검색 제목",
      "warning",
      `현재 ${seoTitle.length}자입니다. 검색 결과에서 잘리지 않도록 60자 안팎을 권장합니다.`,
      "seo-title",
    );
  }

  return createCheck("seo-title", "검색 제목", "passed", `현재 ${seoTitle.length}자입니다.`);
}

function checkSeoDescription(draft) {
  const seoDescription = clean(draft.seoDescription);

  if (!seoDescription) {
    return createCheck(
      "seo-description",
      "검색 설명",
      "error",
      "검색 결과에 표시할 설명을 입력해 주세요.",
      "seo-description",
    );
  }

  if (seoDescription.length > 160) {
    return createCheck(
      "seo-description",
      "검색 설명",
      "warning",
      `현재 ${seoDescription.length}자입니다. 검색 결과에서 잘리지 않도록 160자 안팎을 권장합니다.`,
      "seo-description",
    );
  }

  return createCheck("seo-description", "검색 설명", "passed", `현재 ${seoDescription.length}자입니다.`);
}

function checkImageAlt(draft) {
  if (EMPTY_IMAGE_ALT_PATTERN.test(clean(draft.bodyMarkdown))) {
    return createCheck(
      "image-alt",
      "이미지 설명",
      "error",
      "설명이 비어 있는 이미지가 있습니다.",
      "post-body",
    );
  }

  return createCheck("image-alt", "이미지 설명", "passed", "설명이 비어 있는 이미지가 없습니다.");
}

export function checkPostForPublication(
  draft,
  { existingSlugs = [], originalSlug = "", today = "9999-12-31" } = {},
) {
  const checks = [
    checkRequiredFields(draft),
    checkSlugFormat(draft),
    checkSlugDuplicate(draft, existingSlugs, originalSlug),
    checkBody(draft),
    checkSources(draft, today),
    checkEvidence(draft),
    checkSeoTitle(draft),
    checkSeoDescription(draft),
    checkImageAlt(draft),
  ];
  const errorCount = checks.filter(({ status }) => status === "error").length;
  const warningCount = checks.filter(({ status }) => status === "warning").length;
  const passedCount = checks.filter(({ status }) => status === "passed").length;

  return {
    ready: errorCount === 0,
    errorCount,
    warningCount,
    passedCount,
    checks,
  };
}
