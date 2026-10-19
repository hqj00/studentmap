// src/modules/projection/presets.ts
var REGION_PRESETS = [
  { id: "world", label: "\u4E16\u754C\u5168\u56FE", group: "\u5168\u7403", extent: { minLon: -180, minLat: -90, maxLon: 180, maxLat: 90 } },
  // 中国全图四至：帕米尔高原—黑乌汇合处、曾母暗沙—漠河（含南海诸岛）
  { id: "china", label: "\u4E2D\u56FD\u5168\u56FE\uFF08\u542B\u5357\u6D77\u8BF8\u5C9B\uFF09", group: "\u4E2D\u56FD", extent: { minLon: 73.5, minLat: 3.8, maxLon: 135.1, maxLat: 53.6 } },
  { id: "beijing", label: "\u5317\u4EAC\u5E02", group: "\u4E2D\u56FD", extent: { minLon: 115.4, minLat: 39.5, maxLon: 117.5, maxLat: 41.1 } },
  { id: "qinghai-tibet", label: "\u9752\u85CF\u9AD8\u539F", group: "\u4E2D\u56FD", extent: { minLon: 73.3, minLat: 26, maxLon: 104.8, maxLat: 39.8 } },
  { id: "europe", label: "\u6B27\u6D32", group: "\u5927\u6D32\u4E0E\u5178\u578B\u533A\u57DF", extent: { minLon: -9.5, minLat: 36, maxLon: 66, maxLat: 71 } },
  { id: "chile", label: "\u667A\u5229", group: "\u5927\u6D32\u4E0E\u5178\u578B\u533A\u57DF", extent: { minLon: -75.6, minLat: -56, maxLon: -66, maxLat: -17.5 } },
  { id: "arctic", label: "\u5317\u6781\u5730\u533A", group: "\u6781\u5730", extent: { minLon: -180, minLat: 66.5, maxLon: 180, maxLat: 90 } },
  { id: "antarctic", label: "\u5357\u6781\u5730\u533A", group: "\u6781\u5730", extent: { minLon: -180, minLat: -90, maxLon: 180, maxLat: -66.5 } }
];
function resolveExtent(presetId) {
  return REGION_PRESETS.find((p) => p.id === presetId)?.extent;
}
var PROJECTION_KB = [
  {
    id: "mercator",
    name: "Mercator",
    zhName: "\u58A8\u5361\u6258\u6295\u5F71",
    category: "cylindrical",
    property: "conformal",
    typicalParams: { standardParallels: [0] },
    suitableFor: "\u822A\u6D77\u56FE\u3001\u4F4E\u7EAC\u5EA6\u5730\u533A\u5BFC\u822A\u56FE\uFF1B\u7B49\u89D2\u822A\u7EBF\uFF08\u6052\u5411\u7EBF\uFF09\u5728\u56FE\u4E0A\u4E3A\u76F4\u7EBF",
    pros: ["\u7B49\u89D2\uFF0C\u5C40\u90E8\u5F62\u72B6\u4E0E\u65B9\u5411\u4FDD\u771F\uFF0C\u6052\u5411\u7EBF\u4E3A\u76F4\u7EBF\uFF0C\u6D77\u56FE\u6807\u51C6\u6295\u5F71"],
    cons: ["\u9AD8\u7EAC\u9762\u79EF\u4E25\u91CD\u5938\u5927\uFF08\u683C\u9675\u5170\u5931\u771F\uFF09\uFF0C\u4E0D\u9002\u5408\u5168\u7403\u9762\u79EF\u5BF9\u6BD4"],
    epsgHint: "EPSG:3395\uFF08World Mercator\uFF09\uFF1BWeb \u58A8\u5361\u6258\u53E6\u6709 EPSG:3857",
    refImage: {
      url: "./ref-images/mercator.jpg",
      credit: "Strebe, CC BY-SA 3.0, Wikimedia Commons"
    }
  },
  {
    id: "transverse-mercator",
    name: "Transverse Mercator / Gauss-Kr\xFCger",
    zhName: "\u6A2A\u8F74\u58A8\u5361\u6258 / \u9AD8\u65AF-\u514B\u5415\u683C\u6295\u5F71",
    category: "cylindrical",
    property: "conformal",
    suitableFor: "\u5927\u6BD4\u4F8B\u5C3A\u5730\u5F62\u56FE\uFF08\u6211\u56FD 1:1\u4E07~1:50\u4E07 \u91C7\u7528\uFF0C\u6309 6\xB0/3\xB0 \u5206\u5E26\uFF09\u3001\u5357\u5317\u72ED\u957F\u533A\u57DF",
    pros: ["\u5206\u5E26\u5185\u53D8\u5F62\u6781\u5C0F\uFF0C\u7B49\u89D2\u4FDD\u5F62\uFF0C\u662F\u6211\u56FD\u5927\u6BD4\u4F8B\u5C3A\u5730\u5F62\u56FE\u7684\u56FD\u5BB6\u6807\u51C6\u6295\u5F71"],
    cons: ["\u4E0D\u9002\u5408\u5927\u8303\u56F4\u6210\u56FE\uFF08\u9700\u5206\u5E26\uFF09\uFF0C\u4E1C\u897F\u8DE8\u5EA6\u5927\u65F6\u5E26\u8FB9\u7F18\u53D8\u5F62\u8FC5\u901F\u589E\u5927"],
    epsgHint: "\u6309\u5206\u5E26\u6CE8\u518C\uFF1ACGCS2000 \u9AD8\u65AF-\u514B\u5415\u683C 6\xB0\u5E26 EPSG:4491\u20134501\u30013\xB0\u5E26 EPSG:4513\u20134533\uFF08\u4EE5 EPSG \u6CE8\u518C\u8868\u4E3A\u51C6\uFF09",
    refImage: {
      url: "./ref-images/transverse-mercator.jpg",
      credit: "Strebe, CC BY-SA 3.0, Wikimedia Commons\uFF08\u6A2A\u8F74\u58A8\u5361\u6258\u4E16\u754C\u5168\u56FE\uFF09"
    }
  },
  {
    id: "lambert-conformal-conic",
    name: "Lambert Conformal Conic",
    zhName: "\u5170\u4F2F\u7279\u7B49\u89D2\u5706\u9525\u6295\u5F71",
    category: "conic",
    property: "conformal",
    suitableFor: "\u4E2D\u7EAC\u5EA6\u4E1C\u897F\u5EF6\u5C55\u533A\u57DF\u7684\u6C14\u8C61\u56FE\u3001\u822A\u7A7A\u56FE\uFF0C\u4FDD\u6301\u89D2\u5EA6\u4E0E\u5C40\u90E8\u5F62\u72B6",
    pros: ["\u7B49\u89D2\u4FDD\u5F62\u6001\uFF0C\u4E2D\u7EAC\u5EA6\u4E1C\u897F\u5411\u533A\u57DF\u53D8\u5F62\u5C0F\uFF0C\u6C14\u8C61/\u822A\u7A7A\u56FE\u6807\u51C6"],
    cons: ["\u9762\u79EF\u53D8\u5F62\u660E\u663E\uFF0C\u4E0D\u9002\u5408\u9762\u79EF\u654F\u611F\u7684\u7EDF\u8BA1\u4E13\u9898\u56FE"],
    refImage: {
      url: "./ref-images/lambert-conformal-conic.jpg",
      credit: "Strebe, CC BY-SA 3.0, Wikimedia Commons"
    }
  },
  {
    id: "albers-equal-area-conic",
    name: "Albers Equal-Area Conic",
    zhName: "\u963F\u5C14\u4F2F\u65AF\u7B49\u79EF\u5706\u9525\u6295\u5F71",
    category: "conic",
    property: "equal-area",
    typicalParams: { centralMeridian: 105, standardParallels: [25, 47] },
    suitableFor: "\u4E2D\u7EAC\u5EA6\u7EDF\u8BA1\u4E13\u9898\u56FE\uFF1B\u4E2D\u56FD\u5168\u56FE\u60EF\u4F8B\u53C2\u6570\uFF1A\u53CC\u6807\u51C6\u7EAC\u7EBF 25\xB0N/47\xB0N\uFF0C\u4E2D\u592E\u7ECF\u7EBF 105\xB0E",
    pros: ["\u9762\u79EF\u4E25\u683C\u76F8\u7B49\uFF0C\u7EDF\u8BA1\u4E13\u9898\u56FE\u9996\u9009\uFF1B\u4E2D\u7EAC\u4E1C\u897F\u5411\u533A\u57DF\u6574\u4F53\u53D8\u5F62\u5C0F"],
    cons: ["\u89D2\u5EA6\u4E0E\u5F62\u72B6\u6709\u53D8\u5F62\uFF0C\u8FDC\u79BB\u6807\u51C6\u7EAC\u7EBF\u5904\u5F62\u72B6\u5931\u771F"],
    refImage: {
      url: "./ref-images/albers-equal-area-conic.jpg",
      credit: "Strebe, CC BY-SA 3.0, Wikimedia Commons"
    }
  },
  {
    id: "azimuthal-equidistant",
    name: "Azimuthal Equidistant",
    zhName: "\u65B9\u4F4D\u7B49\u8DDD\u6295\u5F71",
    category: "azimuthal",
    property: "equidistant",
    suitableFor: "\u6781\u5730\u5730\u533A\u3001\u81EA\u4E2D\u5FC3\u70B9\u5411\u5916\u7684\u8DDD\u79BB\u4E0E\u65B9\u4F4D\u91CF\u7B97",
    pros: ["\u81EA\u6295\u5F71\u4E2D\u5FC3\u7684\u8DDD\u79BB\u4E0E\u65B9\u4F4D\u4E25\u683C\u6B63\u786E\uFF0C\u6781\u5730\u4E0E\u822A\u7EBF\u89C4\u5212\u76F4\u89C2"],
    cons: ["\u4EC5\u4E2D\u5FC3\u70B9\u6027\u8D28\u53EF\u9760\uFF0C\u8D8A\u9760\u8FB9\u7F18\u5F62\u72B6\u4E0E\u9762\u79EF\u53D8\u5F62\u8D8A\u5927"],
    refImage: {
      url: "./ref-images/azimuthal-equidistant.jpg",
      credit: "Strebe, CC BY-SA 3.0, Wikimedia Commons"
    }
  },
  {
    id: "polar-stereographic",
    name: "Polar Stereographic",
    zhName: "\u6781\u5730\u7ACB\u4F53\u6295\u5F71",
    category: "azimuthal",
    property: "conformal",
    suitableFor: "\u6781\u5730\u822A\u6D77\u3001\u822A\u7A7A\u4E0E\u79D1\u8003\u7528\u56FE\uFF08\u7B49\u89D2\uFF09",
    pros: ["\u6781\u533A\u7B49\u89D2\u4FDD\u5F62\uFF0C\u662F\u6781\u5730\u79D1\u8003\u4E0E\u5BFC\u822A\u7684\u6807\u51C6\u6295\u5F71"],
    cons: ["\u53EA\u9002\u5408\u6781\u533A\uFF0C\u4E2D\u4F4E\u7EAC\u5EA6\u65E0\u6CD5\u4F7F\u7528"],
    refImage: {
      url: "./ref-images/polar-stereographic.jpg",
      credit: "Strebe, CC BY-SA 3.0, Wikimedia Commons"
    }
  },
  {
    id: "lambert-azimuthal-equal-area",
    name: "Lambert Azimuthal Equal-Area",
    zhName: "\u5170\u4F2F\u7279\u65B9\u4F4D\u7B49\u79EF\u6295\u5F71",
    category: "azimuthal",
    property: "equal-area",
    suitableFor: "\u5927\u6D32\u5C3A\u5EA6\u3001\u6781\u5730\u5730\u533A\u7684\u7B49\u79EF\u4E13\u9898\u5236\u56FE",
    pros: ["\u5927\u6D32/\u6781\u533A\u9762\u79EF\u4FDD\u771F\uFF0C\u517C\u987E\u4E00\u5B9A\u7684\u5F62\u72B6\u4FDD\u6301"],
    cons: ["\u89D2\u5EA6\u53D8\u5F62\u968F\u8FDC\u79BB\u6295\u5F71\u4E2D\u5FC3\u800C\u589E\u5927"],
    refImage: {
      url: "./ref-images/lambert-azimuthal-equal-area.jpg",
      credit: "Strebe, CC BY-SA 3.0, Wikimedia Commons"
    }
  },
  {
    id: "equidistant-cylindrical",
    name: "Equidistant Cylindrical",
    zhName: "\u7B49\u8DDD\u5706\u67F1\u6295\u5F71",
    category: "cylindrical",
    property: "equidistant",
    suitableFor: "\u4F4E\u7EAC\u5EA6\u7B80\u6613\u5236\u56FE\u4E0E\u6559\u5B66\u6F14\u793A\uFF08\u7ECF\u7EAC\u7F51\u4E3A\u65B9\u683C\uFF0C\u76F4\u89C2\u6613\u61C2\uFF09",
    pros: ["\u7ECF\u7EAC\u7F51\u4E3A\u89C4\u5219\u65B9\u683C\uFF0C\u8BA1\u7B97\u4E0E\u7ED8\u5236\u6700\u7B80\u5355\uFF0C\u6559\u5B66\u6F14\u793A\u53CB\u597D"],
    cons: ["\u7B49\u89D2\u3001\u7B49\u79EF\u6027\u8D28\u90FD\u4E0D\u5177\u5907\uFF0C\u5404\u7C7B\u53D8\u5F62\u5168\u9762\u5B58\u5728"],
    refImage: {
      url: "./ref-images/equidistant-cylindrical.jpg",
      credit: "Strebe, CC BY-SA 3.0, Wikimedia Commons"
    }
  },
  {
    id: "gall-peters",
    name: "Gall-Peters",
    zhName: "\u9AD8\u5C14-\u5F7C\u5F97\u65AF\u6295\u5F71",
    category: "cylindrical",
    property: "equal-area",
    suitableFor: "\u4F4E\u7EAC\u5EA6\u53CA\u4E16\u754C\u7684\u9762\u79EF\u5BF9\u6BD4\u4E13\u9898\u56FE",
    pros: ["\u9762\u79EF\u4E25\u683C\u76F8\u7B49\uFF0C\u5168\u7403\u9762\u79EF\u5BF9\u6BD4\u516C\u5E73\uFF08\u6807\u51C6\u7EAC\u7EBF 45\xB0\uFF09"],
    cons: ["\u4F4E\u7EAC\u5F62\u72B6\u62C9\u4F38\u660E\u663E\uFF0C\u89C2\u611F\u5DEE\uFF0C\u4E0D\u9002\u5408\u6302\u56FE"],
    refImage: {
      url: "./ref-images/gall-peters.jpg",
      credit: "Strebe, CC BY-SA 3.0, Wikimedia Commons"
    }
  },
  {
    id: "robinson",
    name: "Robinson",
    zhName: "\u7F57\u5BBE\u900A\u6295\u5F71",
    category: "compromise",
    property: "compromise",
    suitableFor: "\u4E16\u754C\u6302\u56FE\u3001\u6559\u5B66\u6F14\u793A\uFF1A\u5404\u7C7B\u53D8\u5F62\u5747\u8861\uFF0C\u89C6\u89C9\u6548\u679C\u597D",
    pros: ["\u5404\u7C7B\u53D8\u5F62\u6298\u4E2D\u5747\u8861\uFF0C\u89C6\u89C9\u8212\u9002\uFF0C\u4E16\u754C\u6302\u56FE\u5E38\u7528"],
    cons: ["\u7B49\u89D2\u7B49\u79EF\u90FD\u4E0D\u4E25\u683C\uFF0C\u4E0D\u53EF\u7528\u4E8E\u7CBE\u786E\u91CF\u7B97"],
    refImage: {
      url: "./ref-images/robinson.jpg",
      credit: "Strebe, CC BY-SA 3.0, Wikimedia Commons"
    }
  },
  {
    id: "winkel-tripel",
    name: "Winkel Tripel",
    zhName: "\u6E29\u514B\u5C14\u4E09\u91CD\u6295\u5F71",
    category: "compromise",
    property: "compromise",
    suitableFor: "\u4E16\u754C\u5168\u56FE\uFF08\u300A\u56FD\u5BB6\u5730\u7406\u300B\u66FE\u91C7\u7528\uFF09\uFF0C\u6298\u4E2D\u53D8\u5F62",
    pros: ["\u6298\u4E2D\u65B9\u6848\u4E2D\u89C2\u611F\u81EA\u7136\uFF0C\u7ECF\u7EBF\u5F2F\u66F2\u5E73\u6ED1\uFF0C\u4E16\u754C\u5168\u56FE\u5E38\u7528"],
    cons: ["\u65E0\u4E25\u683C\u51E0\u4F55\u6027\u8D28\uFF0C\u9762\u79EF\u4E0E\u89D2\u5EA6\u5747\u4E0D\u53EF\u76F4\u63A5\u91CF\u7B97"],
    refImage: {
      // Commons 文件名用英式拼写 "Winkel triple projection SW.jpg"
      url: "./ref-images/winkel-tripel.jpg",
      credit: "Strebe, CC BY-SA 3.0, Wikimedia Commons"
    }
  },
  {
    id: "mollweide",
    name: "Mollweide",
    zhName: "\u6469\u5C14\u9B4F\u7279\u6295\u5F71",
    category: "pseudocylindrical",
    property: "equal-area",
    suitableFor: "\u4E16\u754C\u8303\u56F4\u7684\u7EDF\u8BA1\u5206\u5E03\u56FE\uFF08\u5982\u4EBA\u53E3\u3001\u6C14\u5019\u5E26\u5206\u5E03\uFF09",
    pros: ["\u5168\u7403\u7B49\u79EF\uFF0C\u5206\u5E03\u7C7B\u4E13\u9898\u56FE\u9762\u79EF\u53EF\u6BD4"],
    cons: ["\u8FB9\u7F18\uFF08\u5C24\u5176\u9AD8\u7EAC\u4E24\u4FA7\uFF09\u89D2\u5EA6\u53D8\u5F62\u5927\uFF0C\u5F62\u72B6\u5931\u771F\u660E\u663E"],
    refImage: {
      url: "./ref-images/mollweide.jpg",
      credit: "Strebe, CC BY-SA 3.0, Wikimedia Commons"
    }
  },
  // —— 以下为 spec/07 §2.1 扩充条目：服务 18 幅总览与 AI 候选，规则引擎不新增规则 ——
  {
    id: "sinusoidal",
    name: "Sinusoidal (Sanson-Flamsteed)",
    zhName: "\u6B63\u5F26\u66F2\u7EBF\u6295\u5F71\uFF08\u6851\u900A\uFF09",
    category: "pseudocylindrical",
    property: "equal-area",
    suitableFor: "\u4F4E\u7EAC\u5EA6\u53CA\u4E16\u754C\u8303\u56F4\u7684\u7B49\u79EF\u5206\u5E03\u56FE\uFF1B\u7ECF\u7EBF\u4E3A\u6B63\u5F26\u66F2\u7EBF\u7684\u5178\u578B\u6559\u5B66\u6848\u4F8B",
    pros: ["\u5168\u7403\u7B49\u79EF\uFF0C\u8D64\u9053\u4E0E\u4E2D\u592E\u7ECF\u7EBF\u4E0A\u65E0\u53D8\u5F62\uFF0C\u4F4E\u7EAC\u5730\u533A\u5F62\u72B6\u4FDD\u6301\u8F83\u597D"],
    cons: ["\u9AD8\u7EAC\u4E0E\u56FE\u5E45\u8FB9\u7F18\u526A\u5207\u53D8\u5F62\u660E\u663E\uFF0C\u7ECF\u7EBF\u4EA4\u89D2\u5931\u771F\u5927"],
    epsgHint: "ESRI:54008\uFF08World Sinusoidal\uFF09\uFF1BPROJ\uFF1A+proj=sinu"
  },
  {
    id: "polyconic",
    name: "Polyconic",
    zhName: "\u591A\u5706\u9525\u6295\u5F71",
    category: "conic",
    property: "compromise",
    suitableFor: "\u6CBF\u4E2D\u592E\u7ECF\u7EBF\u5357\u5317\u5EF6\u5C55\u7684\u4E2D\u7EAC\u5EA6\u533A\u57DF\u56FE\uFF1B\u66FE\u7528\u4E8E\u56FD\u9645 1:100 \u4E07\u5206\u5E45\u5730\u56FE\uFF08\u65E7\u65B9\u6848\uFF09",
    pros: ["\u5404\u7EAC\u7EBF\u5747\u4E0E\u5706\u9525\u76F8\u5207\uFF0C\u4E2D\u592E\u7ECF\u7EBF\u9644\u8FD1\u53D8\u5F62\u5C0F\uFF0C\u5386\u53F2\u4E0A\u7528\u4E8E\u5730\u5F62\u56FE\u5206\u5E45"],
    cons: ["\u65E2\u4E0D\u7B49\u89D2\u4E5F\u4E0D\u7B49\u79EF\uFF0C\u79BB\u4E2D\u592E\u7ECF\u7EBF\u8D8A\u8FDC\u53D8\u5F62\u8D8A\u5927\uFF0C\u5DF2\u88AB\u5170\u4F2F\u7279\u7B49\u89D2\u5706\u9525\u7B49\u53D6\u4EE3"],
    epsgHint: "EPSG \u65B9\u6CD5 9818\uFF08American Polyconic\uFF09\uFF1BPROJ\uFF1A+proj=poly"
  },
  {
    id: "orthographic",
    name: "Orthographic",
    zhName: "\u6B63\u5C04\u65B9\u4F4D\u6295\u5F71",
    category: "azimuthal",
    property: "compromise",
    suitableFor: "\u534A\u7403\u56FE\u4E0E\u300C\u4ECE\u592A\u7A7A\u770B\u5730\u7403\u300D\u7684\u7403\u4F53\u5916\u8C8C\u6559\u5B66\u6F14\u793A",
    pros: ["\u900F\u89C6\u611F\u5F3A\uFF0C\u76F4\u89C2\u5448\u73B0\u7403\u4F53\u5916\u8C8C\uFF0C\u9002\u5408\u5BFC\u5165\u5730\u7403\u5706\u7403\u6982\u5FF5"],
    cons: ["\u53EA\u80FD\u663E\u793A\u4E00\u4E2A\u534A\u7403\uFF0C\u8FB9\u7F18\u538B\u7F29\u4E25\u91CD\uFF0C\u65E2\u4E0D\u7B49\u89D2\u4E5F\u4E0D\u7B49\u79EF"],
    epsgHint: "\u65E0\u5E38\u7528 EPSG \u7F16\u53F7\uFF1BPROJ\uFF1A+proj=ortho"
  },
  {
    id: "gnomonic",
    name: "Gnomonic",
    zhName: "\u7403\u5FC3\u6295\u5F71\uFF08\u65E5\u6677\u6295\u5F71\uFF09",
    category: "azimuthal",
    property: "compromise",
    suitableFor: "\u5927\u5706\u822A\u7EBF\u89C4\u5212\uFF1A\u5927\u5706\uFF08\u6700\u77ED\u822A\u7EBF\uFF09\u5728\u56FE\u4E0A\u6052\u4E3A\u76F4\u7EBF\uFF0C\u914D\u5408\u58A8\u5361\u6258\u56FE\u8F6C\u7ED8\u822A\u70B9",
    pros: ["\u5927\u5706\u5F27\u6295\u5F71\u4E3A\u76F4\u7EBF\uFF0C\u662F\u6C42\u6700\u77ED\u822A\u7EBF\u552F\u4E00\u65B9\u4FBF\u7684\u6295\u5F71"],
    cons: ["\u53EA\u80FD\u663E\u793A\u5C0F\u4E8E\u534A\u7403\u7684\u8303\u56F4\uFF0C\u8FDC\u79BB\u4E2D\u5FC3\u53D8\u5F62\u6025\u5267\u589E\u5927\uFF0C\u65E0\u7B49\u89D2\u7B49\u79EF\u6027\u8D28"],
    epsgHint: "\u65E0\u5E38\u7528 EPSG \u7F16\u53F7\uFF1BPROJ\uFF1A+proj=gnom"
  },
  {
    id: "natural-earth",
    name: "Natural Earth",
    zhName: "\u81EA\u7136\u5730\u7403\u6295\u5F71",
    category: "pseudocylindrical",
    property: "compromise",
    suitableFor: "\u4E16\u754C\u5C0F\u6BD4\u4F8B\u5C3A\u53C2\u8003\u56FE\u4E0E\u6302\u56FE\uFF08Natural Earth \u6570\u636E\u96C6\u914D\u5957\u6295\u5F71\uFF09",
    pros: ["\u6298\u4E2D\u53D8\u5F62\u4E14\u5916\u5F62\u5706\u6DA6\u81EA\u7136\uFF0C\u4E13\u4E3A\u5C0F\u6BD4\u4F8B\u5C3A\u4E16\u754C\u5730\u56FE\u8BBE\u8BA1"],
    cons: ["\u65E0\u4E25\u683C\u51E0\u4F55\u6027\u8D28\uFF0C\u9762\u79EF\u4E0E\u89D2\u5EA6\u5747\u4E0D\u53EF\u76F4\u63A5\u91CF\u7B97"],
    epsgHint: "\u65E0\u5E38\u7528 EPSG \u7F16\u53F7\uFF1BPROJ\uFF1A+proj=natearth"
  },
  {
    id: "equal-earth",
    name: "Equal Earth",
    zhName: "\u7B49\u5730\u7403\u6295\u5F71",
    category: "pseudocylindrical",
    property: "equal-area",
    suitableFor: "\u4E16\u754C\u8303\u56F4\u7EDF\u8BA1\u4E13\u9898\u56FE\uFF082018 \u5E74\u63D0\u51FA\u7684\u73B0\u4EE3\u7B49\u79EF\u6295\u5F71\uFF0CNASA \u7B49\u673A\u6784\u91C7\u7528\uFF09",
    pros: ["\u5168\u7403\u7B49\u79EF\u4E14\u5916\u5F62\u7F8E\u89C2\u3001\u6781\u70B9\u6210\u7EBF\uFF0C\u662F\u4E16\u754C\u4E13\u9898\u56FE\u7684\u73B0\u4EE3\u4F18\u9009"],
    cons: ["\u89D2\u5EA6\u53D8\u5F62\u5B58\u5728\uFF1B\u63D0\u51FA\u65F6\u95F4\u8F83\u65B0\uFF0C\u90E8\u5206\u65E7\u7248\u8F6F\u4EF6\u4E0D\u652F\u6301"],
    epsgHint: "ESRI:54035\uFF08World Equal Earth\uFF09\uFF1BPROJ\uFF1A+proj=eqearth"
  }
];
function findProjection(id) {
  return PROJECTION_KB.find((p) => p.id === id);
}

// src/modules/projection/ruleEngine.ts
function extractFeature(extent) {
  const centerLat = (extent.minLat + extent.maxLat) / 2;
  const latSpan = extent.maxLat - extent.minLat;
  const lonSpan = extent.maxLon - extent.minLon;
  const eastWestKm = lonSpan * Math.cos(centerLat * Math.PI / 180);
  return {
    centerLat,
    latSpan,
    lonSpan,
    shapeRatio: latSpan === 0 ? Infinity : eastWestKm / latSpan,
    isWorld: lonSpan >= 330 && latSpan >= 100,
    // 防止环极的北极/南极地区被误判为世界全图（spec/02 §4.2）
    isChina: extent.minLon <= 75 && extent.maxLon >= 133 && extent.minLat <= 20 && extent.maxLat >= 52
  };
}
function purposeRules(purpose, f) {
  const polar = Math.abs(f.centerLat) > 60;
  switch (purpose) {
    case "navigation":
      return polar ? [{ id: "polar-stereographic", reason: "\u6781\u5730\u822A\u6D77\u822A\u7A7A\u5BFC\u822A\u9700\u7B49\u89D2\u6295\u5F71\uFF0C\u6781\u5730\u7ACB\u4F53\u6295\u5F71\u4FDD\u6301\u89D2\u5EA6\u4E0E\u5C40\u90E8\u5F62\u72B6", confidence: 0.9 }] : [{ id: "mercator", reason: "\u822A\u6D77\u5BFC\u822A\u8981\u6C42\u7B49\u89D2\u6295\u5F71\uFF1A\u7B49\u89D2\u822A\u7EBF\uFF08\u6052\u5411\u7EBF\uFF09\u5728\u58A8\u5361\u6258\u56FE\u4E0A\u4E3A\u76F4\u7EBF\uFF0C\u4FBF\u4E8E\u91CF\u7B97\u822A\u5411", confidence: 0.9 }];
    case "topographic":
      return [
        {
          id: "transverse-mercator",
          reason: "\u5927\u6BD4\u4F8B\u5C3A\u5730\u5F62\u56FE\u91C7\u7528\u6A2A\u8F74\u7B49\u89D2\u6295\u5F71\uFF08\u9AD8\u65AF-\u514B\u5415\u683C / \u6A2A\u8F74\u58A8\u5361\u6258\uFF09\uFF0C\u6309 6\xB0 \u6216 3\xB0 \u5206\u5E26\u63A7\u5236\u53D8\u5F62",
          confidence: 0.9
        }
      ];
    case "meteorology":
      return [
        {
          id: "lambert-conformal-conic",
          reason: "\u4E2D\u7EAC\u5EA6\u6C14\u8C61\u56FE\u9700\u4FDD\u6301\u950B\u9762\u4E0E\u7B49\u538B\u7EBF\u5F62\u6001\uFF0C\u5170\u4F2F\u7279\u7B49\u89D2\u5706\u9525\u6295\u5F71\u4E3A\u4E2D\u7EAC\u5EA6\u6807\u51C6\u9009\u62E9",
          confidence: 0.9
        }
      ];
    case "polar":
      return [
        { id: "polar-stereographic", reason: "\u6781\u5730\u5236\u56FE\u5E38\u7528\u6781\u5730\u7ACB\u4F53\u6295\u5F71\uFF08\u7B49\u89D2\uFF09\uFF0C\u6781\u70B9\u9644\u8FD1\u53D8\u5F62\u6700\u5C0F", confidence: 0.9 },
        { id: "azimuthal-equidistant", reason: "\u65B9\u4F4D\u7B49\u8DDD\u6295\u5F71\u53EF\u81EA\u6781\u70B9\u5411\u5916\u6B63\u786E\u91CF\u7B97\u8DDD\u79BB\u4E0E\u65B9\u4F4D", confidence: 0.8 }
      ];
    default:
      return [];
  }
}
function latitudeBandRules(purpose, f) {
  const absLat = Math.abs(f.centerLat);
  const wantEqualArea = purpose === "statistic";
  if (absLat > 60) {
    return wantEqualArea ? [{ id: "lambert-azimuthal-equal-area", reason: `\u533A\u57DF\u4E2D\u5FC3\u7EAC\u5EA6 ${f.centerLat.toFixed(1)}\xB0 \u5C5E\u9AD8\u7EAC/\u6781\u5730\u5E26\uFF0C\u4E14\u7EDF\u8BA1\u5236\u56FE\u8981\u6C42\u7B49\u79EF\uFF0C\u5B9C\u7528\u65B9\u4F4D\u7B49\u79EF\u6295\u5F71`, confidence: 0.75 }] : [{ id: "polar-stereographic", reason: `\u533A\u57DF\u4E2D\u5FC3\u7EAC\u5EA6 ${f.centerLat.toFixed(1)}\xB0 \u5C5E\u9AD8\u7EAC/\u6781\u5730\u5E26\uFF0C\u65B9\u4F4D\u7C7B\u6295\u5F71\u4EE5\u6781\u70B9\u4E3A\u4E2D\u5FC3\u53D8\u5F62\u6700\u5C0F`, confidence: 0.75 }];
  }
  if (absLat >= 25) {
    return wantEqualArea ? [{ id: "albers-equal-area-conic", reason: `\u533A\u57DF\u4E2D\u5FC3\u7EAC\u5EA6 ${f.centerLat.toFixed(1)}\xB0 \u4F4D\u4E8E\u4E2D\u7EAC\u5EA6\u5E26\uFF0C\u7EDF\u8BA1\u4E13\u9898\u56FE\u8981\u6C42\u9762\u79EF\u6B63\u786E\uFF0C\u963F\u5C14\u4F2F\u65AF\u7B49\u79EF\u5706\u9525\u4E3A\u9996\u9009`, confidence: 0.75 }] : [{ id: "lambert-conformal-conic", reason: `\u533A\u57DF\u4E2D\u5FC3\u7EAC\u5EA6 ${f.centerLat.toFixed(1)}\xB0 \u4F4D\u4E8E\u4E2D\u7EAC\u5EA6\u4E1C\u897F\u5EF6\u5C55\u5E26\uFF0C\u5706\u9525\u6295\u5F71\u6CBF\u6807\u51C6\u7EAC\u7EBF\u53D8\u5F62\u6700\u5C0F`, confidence: 0.75 }];
  }
  return wantEqualArea ? [{ id: "gall-peters", reason: `\u533A\u57DF\u4E2D\u5FC3\u7EAC\u5EA6 ${f.centerLat.toFixed(1)}\xB0 \u4F4D\u4E8E\u4F4E\u7EAC/\u8D64\u9053\u5E26\uFF0C\u5706\u67F1\u7B49\u79EF\u6295\u5F71\u517C\u987E\u9762\u79EF\u4E0E\u7B80\u5355\u7ECF\u7EAC\u7F51`, confidence: 0.75 }] : [
    { id: "mercator", reason: `\u533A\u57DF\u4E2D\u5FC3\u7EAC\u5EA6 ${f.centerLat.toFixed(1)}\xB0 \u4F4D\u4E8E\u4F4E\u7EAC/\u8D64\u9053\u5E26\uFF0C\u5207\u8D64\u9053\u5706\u67F1\u6295\u5F71\u53D8\u5F62\u6700\u5C0F`, confidence: 0.75 },
    { id: "equidistant-cylindrical", reason: "\u7B49\u8DDD\u5706\u67F1\u7ECF\u7EAC\u7F51\u4E3A\u89C4\u5219\u65B9\u683C\uFF0C\u4F4E\u7EAC\u6559\u5B66\u6F14\u793A\u76F4\u89C2", confidence: 0.65 }
  ];
}
function specialRules(purpose, f) {
  const hits = [];
  if (f.isChina && (purpose === "statistic" || purpose === "general")) {
    hits.push({
      id: "albers-equal-area-conic",
      reason: "\u547D\u4E2D\u4E2D\u56FD\u5168\u56FE\u60EF\u4F8B\uFF1A\u963F\u5C14\u4F2F\u65AF\u7B49\u79EF\u5706\u9525\uFF0C\u53CC\u6807\u51C6\u7EAC\u7EBF 25\xB0N / 47\xB0N\u3001\u4E2D\u592E\u7ECF\u7EBF 105\xB0E\uFF08\u300A\u4E2D\u56FD\u5168\u56FE\u300B\u5E38\u7528\u65B9\u6848\uFF09",
      confidence: 0.9
    });
  }
  if (f.isWorld) {
    if (purpose === "education" || purpose === "general") {
      hits.push(
        { id: "robinson", reason: "\u4E16\u754C\u6302\u56FE\u5B9C\u9009\u7528\u6298\u4E2D\u6295\u5F71\uFF1A\u7F57\u5BBE\u900A\u6295\u5F71\u5404\u7C7B\u53D8\u5F62\u5747\u8861\u3001\u89C6\u89C9\u6548\u679C\u597D", confidence: 0.85 },
        { id: "winkel-tripel", reason: "\u6E29\u514B\u5C14\u4E09\u91CD\u6295\u5F71\u540C\u4E3A\u4E16\u754C\u5168\u56FE\u5E38\u7528\u6298\u4E2D\u65B9\u6848\uFF08\u300A\u56FD\u5BB6\u5730\u7406\u300B\u66FE\u91C7\u7528\uFF09", confidence: 0.8 }
      );
    } else if (purpose === "statistic") {
      hits.push({ id: "mollweide", reason: "\u4E16\u754C\u8303\u56F4\u7EDF\u8BA1\u5206\u5E03\u56FE\u8981\u6C42\u5168\u7403\u9762\u79EF\u53EF\u6BD4\uFF0C\u6469\u5C14\u9B4F\u7279\u4E3A\u7B49\u79EF\u4F2A\u5706\u67F1\u6295\u5F71", confidence: 0.85 });
    }
  }
  if (f.shapeRatio < 0.6 && purpose !== "statistic") {
    hits.push({
      id: "transverse-mercator",
      reason: `\u533A\u57DF\u5F62\u72B6\u6BD4 ${f.shapeRatio.toFixed(2)}\uFF08\u5357\u5317\u72ED\u957F\uFF09\uFF0C\u6A2A\u8F74\u58A8\u5361\u6258\u6CBF\u5357\u5317\u4E2D\u592E\u7ECF\u7EBF\u53D8\u5F62\u6700\u5C0F`,
      confidence: 0.8
    });
  }
  return hits;
}
function suitabilityAt(info, lat) {
  const absLat = Math.abs(lat);
  if (absLat > 60) {
    return info.category === "azimuthal" ? { hit: true, text: `${absLat.toFixed(1)}\xB0 \u5C5E\u9AD8\u7EAC/\u6781\u5730\u5E26\uFF0C\u5B9C\u7528\u65B9\u4F4D\u7C7B\u6295\u5F71\uFF08\u4EE5\u6781\u70B9\u4E3A\u4E2D\u5FC3\u53D8\u5F62\u6700\u5C0F\uFF09` } : { hit: false, text: `${absLat.toFixed(1)}\xB0 \u5C5E\u9AD8\u7EAC/\u6781\u5730\u5E26\uFF0C\u5B9C\u7528\u65B9\u4F4D\u7C7B\u6295\u5F71\uFF1B\u672C\u5E45\u4E3A${categoryZh(info)}\u6295\u5F71` };
  }
  if (absLat >= 25) {
    return info.category === "conic" ? { hit: true, text: `${absLat.toFixed(1)}\xB0 \u5C5E\u4E2D\u7EAC\u5EA6\u5E26\uFF0C\u5B9C\u7528\u5706\u9525\u6295\u5F71\uFF08\u6CBF\u6807\u51C6\u7EAC\u7EBF\u53D8\u5F62\u6700\u5C0F\uFF09` } : { hit: false, text: `${absLat.toFixed(1)}\xB0 \u5C5E\u4E2D\u7EAC\u5EA6\u5E26\uFF0C\u5B9C\u7528\u5706\u9525\u6295\u5F71\uFF1B\u672C\u5E45\u4E3A${categoryZh(info)}\u6295\u5F71` };
  }
  return info.category === "cylindrical" ? { hit: true, text: `${absLat.toFixed(1)}\xB0 \u5C5E\u4F4E\u7EAC/\u8D64\u9053\u5E26\uFF0C\u5B9C\u7528\u5706\u67F1\u6295\u5F71\uFF08\u5207/\u5272\u7EAC\u7EBF\u9644\u8FD1\u53D8\u5F62\u6700\u5C0F\uFF09` } : { hit: false, text: `${absLat.toFixed(1)}\xB0 \u5C5E\u4F4E\u7EAC/\u8D64\u9053\u5E26\uFF0C\u5B9C\u7528\u5706\u67F1\u6295\u5F71\uFF1B\u672C\u5E45\u4E3A${categoryZh(info)}\u6295\u5F71` };
}
var CATEGORY_ZH = {
  cylindrical: "\u5706\u67F1",
  conic: "\u5706\u9525",
  azimuthal: "\u65B9\u4F4D",
  pseudocylindrical: "\u4F2A\u5706\u67F1",
  compromise: "\u6298\u4E2D"
};
function categoryZh(info) {
  return CATEGORY_ZH[info.category];
}
function recommendByRule(req) {
  const extent = req.region.kind === "extent" ? req.region.extent : resolveExtent(req.region.presetId);
  if (!extent) return [];
  const f = extractFeature(extent);
  const hits = [...specialRules(req.purpose, f), ...purposeRules(req.purpose, f), ...latitudeBandRules(req.purpose, f)];
  const byId = /* @__PURE__ */ new Map();
  for (const hit of hits) {
    const prev = byId.get(hit.id);
    if (!prev || hit.confidence > prev.confidence) byId.set(hit.id, hit);
  }
  return [...byId.values()].sort((a, b) => b.confidence - a.confidence).slice(0, 4).flatMap((hit) => {
    const projection = findProjection(hit.id);
    return projection ? [{ projection, reason: hit.reason, source: "rule", confidence: hit.confidence }] : [];
  });
}
export {
  recommendByRule,
  suitabilityAt
};
