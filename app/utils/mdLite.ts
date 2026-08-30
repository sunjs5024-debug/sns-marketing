// 경량 마크다운 렌더 — 상품 상세·가이드 본문 가독성용.
//   우리 DB/콘텐츠(관리자·내부 작성) 전용이라 v-html 안전. 그래도 HTML 이스케이프 먼저 → XSS 방지.
//   지원: `## 소제목`(h3), `### 소제목`(h4), `**볼드**`, `- 불릿`(또는 •), `| 표 |`(GFM 표), 빈 줄=문단 분리.
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
  // GFM 표: 헤더행 다음 줄이 구분선(| --- | --- |)인지로 판정
  const isSep = (l: string) => /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/.test(l.trim());
  const cells = (l: string) =>
    l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) { closeList(); continue; }
    // 표 블록: 현재 줄이 |...| 이고 다음 줄이 구분선
    if (line.startsWith("|") && i + 1 < lines.length && isSep(lines[i + 1])) {
      closeList();
      const header = cells(line);
      const rows: string[][] = [];
      i += 2; // 헤더 + 구분선 건너뜀
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(cells(lines[i].trim()));
        i++;
      }
      i--; // for 루프의 ++ 보정
      let t = '<div class="my-3 overflow-x-auto"><table class="w-full border-collapse text-[13px] sm:text-sm"><thead><tr>';
      t += header.map((h) => `<th class="border border-neutral-200 bg-neutral-50 px-3 py-2 text-left font-semibold text-neutral-800">${inline(h)}</th>`).join("");
      t += "</tr></thead><tbody>";
      t += rows.map((r) => "<tr>" + r.map((c) => `<td class="border border-neutral-200 px-3 py-2 align-top">${inline(c)}</td>`).join("") + "</tr>").join("");
      t += "</tbody></table></div>";
      out.push(t);
      continue;
    }
    if (line.startsWith("### ")) {
      closeList();
      out.push(`<h4 class="mt-5 mb-1 font-display text-sm font-semibold text-neutral-900">${inline(line.slice(4))}</h4>`);
    } else if (line.startsWith("## ")) {
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
