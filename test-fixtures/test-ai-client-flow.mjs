// 模拟前端 aiClient 的真实请求打云端函数，检查 content 能否按契约解析
const resp = await fetch('https://1509546024-6mu42w642m.ap-shanghai.tencentscf.com/ai/recommend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      {
        role: 'system',
        content:
          '你是地图学助教，熟悉地图投影的分类、变形性质与参数设置。只能从给定候选投影 id 中选择或微调参数，不得编造投影。严格输出 JSON：{"recommendations":[{"id":"...","reason":"...","params":{"centralMeridian":105,"standardParallels":[25,47]}}]}',
      },
      {
        role: 'user',
        content: JSON.stringify({
          区域: '预设区域：中国全图（含南海诸岛）',
          用途: '统计专题制图（面积敏感）',
          规则候选: [{ id: 'albers-equal-area-conic', 理由: '命中中国全图惯例' }],
          投影知识库: [{ id: 'albers-equal-area-conic', 名称: '阿尔伯斯等积圆锥投影', 性质: 'equal-area', 适用: '中纬度统计专题图' }],
        }),
      },
    ],
  }),
  signal: AbortSignal.timeout(150_000),
})
const data = await resp.json()
const text = data.content ?? ''
console.log('HTTP', resp.status, '· content 前 300 字符:')
console.log(text.slice(0, 300))
// 复刻前端解析逻辑
const jsonStart = text.indexOf('{')
let parseOk = false
try {
  if (jsonStart >= 0) JSON.parse(text.slice(jsonStart))
  parseOk = true
} catch (e) {
  console.log('解析失败:', e.message)
}
console.log('前端解析逻辑结果:', parseOk ? 'OK' : 'FAIL')
