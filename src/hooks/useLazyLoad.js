import { onMounted, onUnmounted } from "vue"

function callback(entries, observer) {
    entries.forEach((entry) => {
        if (entry.intersectionRatio <= 0) return
        const img = entry.target
        const src = img.getAttribute("data-src")
        img.setAttribute("src", src)
        observer.unobserve(img)
    })
}
const options = {
    rootMargin: "0px 0px 500px 0px", //提前 500px 触发加载
    threshold: 0.01,                // 1%可见即触发
    once: true                      // 加载后停止观察
}
export function useLazyLoad(elementRef) {
    const observer = new IntersectionObserver(callback, options)
    onMounted(() => {
        Object.keys(elementRef.value).forEach((key) => {
            const element = elementRef.value[key]
            if (element) {
                observer.observe(element)
            }
        })
    })
    onUnmounted(() => {
        Object.keys(elementRef.value).forEach((key) => {
            const element = elementRef.value[key]
            if (element) {
                observer.unobserve(element)
            }
        })
    })
}