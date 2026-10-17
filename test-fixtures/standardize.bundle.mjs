// src/modules/symbol/standardize.ts
var FORBIDDEN_TAGS = ["script", "foreignObject"];
function checkAndNormalizeSvg(svgText) {
  const issues = [];
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  if (doc.querySelector("parsererror")) {
    return { ok: false, issues: [{ level: "error", message: "SVG \u65E0\u6CD5\u89E3\u6790\uFF0C\u8BF7\u786E\u8BA4\u6587\u4EF6\u5B8C\u6574\u4E14\u4E3A\u77E2\u91CF SVG\uFF08\u975E\u4F4D\u56FE\u6539\u540D\uFF09" }] };
  }
  const root = doc.documentElement;
  if (root.tagName.toLowerCase() !== "svg") {
    return { ok: false, issues: [{ level: "error", message: "\u6839\u5143\u7D20\u4E0D\u662F <svg>" }] };
  }
  for (const tag of FORBIDDEN_TAGS) {
    if (doc.getElementsByTagName(tag).length > 0) {
      issues.push({ level: "error", message: `\u5305\u542B\u7981\u6B62\u5143\u7D20 <${tag}>\uFF0C\u5B58\u5728\u5B89\u5168\u98CE\u9669\uFF0C\u8BF7\u79FB\u9664\u540E\u91CD\u65B0\u5BFC\u51FA` });
    }
  }
  const all = Array.from(doc.querySelectorAll("*"));
  const hasExternalRef = all.some(
    (el) => ["href", "xlink:href"].some((attr) => /^https?:\/\//.test(el.getAttribute(attr) ?? ""))
  );
  if (hasExternalRef) {
    issues.push({ level: "error", message: "\u5305\u542B\u5916\u90E8\u8D44\u6E90\u5F15\u7528\uFF08http/https \u94FE\u63A5\u7684\u56FE\u7247\u6216\u5F15\u7528\uFF09\uFF0C\u7B26\u53F7\u5FC5\u987B\u79BB\u7EBF\u53EF\u7528" });
  }
  if (doc.getElementsByTagName("text").length > 0) {
    issues.push({ level: "warning", message: "\u5305\u542B\u672A\u8F6C\u66F2\u6587\u5B57 <text>\uFF0C\u8BF7\u56DE Illustrator \u6267\u884C\u300C\u6587\u5B57 \u2192 \u521B\u5EFA\u8F6E\u5ED3\u300D" });
  }
  if (!root.getAttribute("viewBox")) {
    const w = parseFloat(root.getAttribute("width") ?? "");
    const h = parseFloat(root.getAttribute("height") ?? "");
    if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
      root.setAttribute("viewBox", `0 0 ${w} ${h}`);
      issues.push({ level: "warning", message: `\u7F3A\u5C11 viewBox\uFF0C\u5DF2\u6309 width/height \u81EA\u52A8\u8865\u5168\u4E3A 0 0 ${w} ${h}` });
    } else {
      issues.push({ level: "error", message: "\u7F3A\u5C11 viewBox \u4E14\u65E0\u6CD5\u4ECE width/height \u63A8\u5BFC\uFF0C\u7F29\u653E\u5C06\u5931\u771F" });
    }
  }
  const vb = (root.getAttribute("viewBox") ?? "").trim().split(/[\s,]+/).map(Number);
  if (vb.length === 4 && vb.every(Number.isFinite) && vb[2] !== vb[3]) {
    issues.push({
      level: "warning",
      message: `\u753B\u677F\u975E\u6B63\u65B9\u5F62\uFF08${vb[2]}\xD7${vb[3]}\uFF09\uFF0C\u5EFA\u8BAE 64\xD764 \u57FA\u51C6\u6B63\u65B9\u5F62\u753B\u677F`
    });
  }
  const strokeWidths = new Set(
    all.map((el) => parseFloat(el.getAttribute("stroke-width") ?? "")).filter((v) => Number.isFinite(v) && v > 0)
  );
  if (strokeWidths.size >= 2) {
    issues.push({
      level: "warning",
      message: `\u68C0\u6D4B\u5230\u591A\u79CD\u7EBF\u5BBD\uFF08${[...strokeWidths].sort((a, b) => a - b).join("px\u3001")}px\uFF09\uFF0C\u540C\u7EC4\u7B26\u53F7\u7EBF\u5BBD\u5E94\u7EDF\u4E00\uFF08\u5EFA\u8BAE 2~4px\uFF09`
    });
  }
  const minStroke = Math.min(...strokeWidths);
  if (strokeWidths.size > 0 && minStroke < 0.5) {
    issues.push({ level: "warning", message: `\u5B58\u5728\u8FC7\u7EC6\u7EBF\u6761\uFF08${minStroke}px\uFF09\uFF0C\u7F29\u653E\u540E\u5C06\u4E0D\u6E05\u6670` });
  }
  const fills = new Set(
    all.map((el) => el.getAttribute("fill")).filter((v) => !!v && v !== "none" && v !== "currentColor")
  );
  if (fills.size > 3) {
    issues.push({
      level: "warning",
      message: `\u586B\u5145\u8272\u5171 ${fills.size} \u79CD\uFF08${[...fills].slice(0, 4).join("\u3001")}\u2026\uFF09\uFF0C\u5730\u56FE\u7B26\u53F7\u7528\u8272\u5E94\u514B\u5236\uFF08\u22643 \u79CD\uFF09`
    });
  }
  if (!all.some((el) => el.getAttribute("fill") === "currentColor") && fills.size > 1) {
    issues.push({ level: "info", message: "\u5EFA\u8BAE\u5355\u4F53\u7B26\u53F7\u4F7F\u7528\u5355\u8272\u5E76\u6539\u4E3A currentColor\uFF0C\u4FBF\u4E8E\u914D\u56FE\u65F6\u6574\u4F53\u6362\u8272" });
  }
  const serialized = new XMLSerializer().serializeToString(doc);
  if (new Blob([serialized]).size > 512 * 1024) {
    issues.push({ level: "warning", message: "\u6587\u4EF6\u8D85\u8FC7 512KB\uFF0C\u5EFA\u8BAE\u56DE Illustrator \u7CBE\u7B80\u951A\u70B9\u540E\u91CD\u65B0\u5BFC\u51FA" });
  }
  return { ok: !issues.some((i) => i.level === "error"), issues, normalized: serialized };
}
export {
  checkAndNormalizeSvg
};
