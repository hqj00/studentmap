// src/modules/symbol/iconify.ts
var API = "https://api.iconify.design";
var ZH_KEYWORDS = {
  \u52A0\u6CB9\u7AD9: "gas station",
  \u533B\u9662: "hospital",
  \u5B66\u6821: "school",
  \u94F6\u884C: "bank",
  \u8F66\u7AD9: "bus station",
  \u706B\u8F66\u7AD9: "train station",
  \u673A\u573A: "airport",
  \u516C\u56ED: "park",
  \u5546\u573A: "shopping mall",
  \u8D85\u5E02: "supermarket",
  \u9152\u5E97: "hotel",
  \u9910\u5385: "restaurant",
  \u5496\u5561: "cafe",
  \u90AE\u5C40: "post office",
  \u4E66\u5E97: "bookstore",
  \u56FE\u4E66\u9986: "library",
  \u535A\u7269\u9986: "museum",
  \u4F53\u80B2\u9986: "stadium",
  \u836F\u5E97: "pharmacy",
  \u8B66\u5C40: "police",
  \u6D88\u9632: "fire station",
  \u505C\u8F66\u573A: "parking",
  \u5395\u6240: "restroom toilet",
  \u666F\u533A: "tourism scenic",
  \u6865: "bridge",
  \u96A7\u9053: "tunnel",
  \u6C34\u5E93: "reservoir water",
  \u5DE5\u5382: "factory",
  \u6559\u5802: "church",
  \u5BFA\u5E99: "temple",
  \u6C14\u8C61\u53F0: "weather station",
  \u5730\u94C1: "subway metro",
  \u706F\u5854: "lighthouse",
  \u6E2F\u53E3: "harbor port",
  \u957F\u57CE: "great wall landmark"
};
function toQuery(description) {
  const desc = description.trim();
  for (const [zh, en] of Object.entries(ZH_KEYWORDS)) {
    if (desc.includes(zh)) return { query: en, translated: true };
  }
  return { query: desc, translated: false };
}
async function searchIcons(query, limit = 48) {
  const resp = await fetch(`${API}/search?query=${encodeURIComponent(query)}&limit=${limit}`);
  if (!resp.ok) throw new Error(`Iconify \u641C\u7D22\u5931\u8D25\uFF1AHTTP ${resp.status}`);
  const data = await resp.json();
  return data.icons ?? [];
}
function iconSvgUrl(name) {
  return `${API}/${name.replace(":", "/")}.svg`;
}
async function fetchIconSvg(name) {
  const resp = await fetch(iconSvgUrl(name));
  if (!resp.ok) throw new Error(`\u4E0B\u8F7D\u56FE\u6807\u5931\u8D25\uFF1AHTTP ${resp.status}`);
  return resp.text();
}
function iconfontSearchUrl(keyword) {
  return `https://www.iconfont.cn/search/index?q=${encodeURIComponent(keyword)}`;
}
export {
  ZH_KEYWORDS,
  fetchIconSvg,
  iconSvgUrl,
  iconfontSearchUrl,
  searchIcons,
  toQuery
};
