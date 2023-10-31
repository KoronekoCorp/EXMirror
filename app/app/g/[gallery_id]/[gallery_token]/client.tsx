"use client"

import { LinearProgress } from "@mui/material"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"


export function NextPage({ gallery_id, gallery_token, p }: { gallery_id: string, gallery_token: string, p: number }) {
    const ref = useRef<HTMLDivElement | null>(null)
    const router = useRouter()

    const init = () => {
        var observer = new IntersectionObserver((entries) => {
            entries.forEach(item => {
                /*
                 * item.time发生相交到相应的时间，毫秒
                 * item.rootBounds：根元素矩形区域的信息，如果没有设置根元素则返回 null，图中蓝色部分区域。
                 * item.boundingClientRect：目标元素的矩形区域的信息，图中黑色边框的区域。
                 * item.intersectionRect：目标元素与视口（或根元素）的交叉区域的信息，图中蓝色方块和粉红色方块相交的区域。
                 * item.isIntersecting：目标元素与根元素是否相交
                 * item.intersectionRatio：目标元素与视口（或根元素）的相交比例。
                 * item.target：目标元素，图中黑色边框的部分。
                 */
                if (item.isIntersecting) {
                    observer.disconnect()
                    router.push(`/g/${gallery_id}/${gallery_token}?p=${p + 1}`)
                }
            })
        });
        setTimeout(() => {
            if (ref.current) {
                observer.observe(ref.current)
            }
        }, 5000);
        return () => observer.disconnect()
    }

    useEffect(() => init(), [gallery_id, gallery_token, p])

    return <div className="container" style={{ paddingTop: 10 }} ref={ref}>
        <LinearProgress />
    </div>
}