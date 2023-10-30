"use client"

import { mpvdata, mpvimg } from "@/Data/EType";
import { useEffect, useRef, useState } from "react";
import { get_image } from "./API";
import { Skeleton } from "@mui/material"

export function MPVImage({ gid, page, mpvdata, mpvkey }: { gid: number, page: number, mpvdata: mpvdata, mpvkey: string }) {
    const ref = useRef<HTMLDivElement | null>(null)
    const [isloaded, setload] = useState(false)
    const [data, setdata] = useState<mpvimg | undefined>(undefined)
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
                    get_image(gid, page, mpvdata.k, mpvkey).then((e) => {
                        setdata(e)
                    })
                    if (ref.current) {
                        observer.observe(ref.current)
                    }
                }
            })
        });
        if (ref.current) {
            observer.observe(ref.current)
        }
        return () => observer.disconnect()
    }

    useEffect(() => init(), [])



    return <>
        {data && <>
            <img
                id="pic_cover"
                loading="lazy"
                className="lazyload blur-up"
                data-src={"https://aeiljuispo.cloudimg.io/" + data.i}
                onLoad={() => setload(true)}
                style={{ width: "100%" }}
            />
            {/* <p>{data.d}</p> */}
        </>}
        {!isloaded && <Skeleton variant="rectangular" width="100%" height="800px" ref={ref} />}
    </>

}