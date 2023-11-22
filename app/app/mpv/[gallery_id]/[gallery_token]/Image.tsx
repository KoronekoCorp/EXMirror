"use client"

import { mpvdata, mpvimg } from "@/Data/EType";
import { useContext, useEffect, useRef, useState } from "react";
import { Control } from "./Control";
import { Skeleton } from "@mui/material";
import { enqueueSnackbar } from "notistack";

export function MPVImage({ gid, page, mpvdata, mpvkey, load }: { gid: number, page: number, mpvdata: mpvdata, mpvkey: string, load: boolean }) {
    const control = useContext(Control)

    const ref = useRef<HTMLDivElement | null>(null)
    const [data, setdata] = useState<mpvimg | undefined>(undefined)
    const [error, seterror] = useState(0)
    const [loaded, setloaded] = useState(false)

    const get_url = (): string => {
        switch (error) {
            case 0:
                return "https://aeiljuispo.cloudimg.io/" + data?.i
            case 1:
                return data?.i ?? ""
            default:
                return "https://static.sirin.top/" + data?.i
        }
    }

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
                    control(page)
                    observer.disconnect()
                }
            })
        });
        if (ref.current) {
            observer.observe(ref.current)
        }
        return () => observer.disconnect()
    }

    const loaddata = async () => {
        try {
            setdata(await (await fetch(`/api/mpv/${gid}/${page}/${mpvdata.k}/${mpvkey}`)).json())
        } catch (e) {
            enqueueSnackbar(`Error:${e}`, { variant: "error", transitionDuration: 1000 })
            loaddata()
        }
    }

    useEffect(() => {
        if (load) {
            loaddata()
        }
        return init()
    }, [gid, page, load])

    return <>
        <div ref={ref} >
            {data ? <img
                id="pic_cover"
                loading="eager"
                className="lazyload blur-up"
                src={get_url()}
                onError={() => seterror(error + 1)}
                onLoad={() => setloaded(true)}
                style={{ width: "100%", minHeight: loaded ? 0 : 800 }}
            /> : <Skeleton variant="rectangular" width="100%" height="800px" />}
        </div>
    </>
}