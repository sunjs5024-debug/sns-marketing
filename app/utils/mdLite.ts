// 경량 마크다운 렌더 — 상품 상세·가이드 본문 가독성용.
//   우리 DB(관리자 작성) 콘텐츠 전용이라 v-html 안전. 그래도 HTML 이스케이프 먼저 → XSS 방지.
//   지원: `## 소제목`, `**볼드**`, `- 불릿`(또는 •), 빈 줄=문단 분리. (풀 마크다운 아님 — 딱 필요한 것만.)
export function mdLite(src?: string | null): string {
  if (!src) return "";
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let inList = false;
  const closeList = () => {
    if (inList) { out.push("</ul>"); inList = false; }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { closeList(); continue; }
    if (line.startsWith("## ")) {
      closeList();
      out.push(`<h3 class="mt-6 mb-1 font-display text-base text-neutral-900">${inline(line.slice(3))}</h3>`);
    } else if (/^[-•]\s+/.test(line)) {
      if (!inList) { out.push('<ul class="my-2.5 space-y-1.5">'); inList = true; }
      out.push(
        `<li class="flex gap-2"><span class="mt-0.5 text-indigo-500">·</span><span>${inline(line.replace(/^[-•]\s+/, ""))}</span></li>`,
      );
    } else {
      closeList();
      out.push(`<p class="mt-2.5 leading-7">${inline(line)}</p>`);
    }
  }
  closeList();
  return out.join("\n");
}
