import { onMounted, onUnmounted, ref } from 'vue'

/** 响应式判定（spec/04 §9）：默认断点 768px */
export function useIsMobile(query = '(max-width: 768px)') {
  const isMobile = ref(false)
  let mq: MediaQueryList | null = null
  const update = () => {
    isMobile.value = !!mq?.matches
  }
  onMounted(() => {
    mq = window.matchMedia(query)
    update()
    mq.addEventListener('change', update)
  })
  onUnmounted(() => mq?.removeEventListener('change', update))
  return isMobile
}
