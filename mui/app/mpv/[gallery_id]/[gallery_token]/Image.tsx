"use client"

import { mpvdata, mpvimg } from "@/Data/EType";
import { useContext, useEffect, useRef, useState } from "react";
import { Control } from "./Control";
import { Skeleton } from "@mui/material";
import { enqueueSnackbar } from "notistack";

export function MPVImage({ gid, page, mpvdata, mpvkey, load, time }:
    { gid: number, page: number, mpvdata: mpvdata, mpvkey: string, load: boolean, time?: number }) {
    const control = useContext(Control)

    const ref = useRef<HTMLDivElement | null>(null)
    const [data, setdata] = useState<mpvimg>()
    const [error, seterror] = useState(0)
    const mirror = localStorage.getItem("mirror") ?? "aeiljuispo.cloudimg.io"

    const get_url = (): string => {
        switch (error) {
            case 0:
                return `https://${mirror}/v7/` + data?.i
            default:
                return data?.i ?? ""
        }
    }

    const init = () => {
        const observer = new IntersectionObserver((entries) => {
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
        const timer = setTimeout(() => {
            if (ref.current) {
                observer.observe(ref.current)
            }
        }, time ?? 5000);
        return () => {
            clearTimeout(timer)
            observer.disconnect()
        }
    }

    const loaddata = async () => {
        try {
            setdata(await (await fetch(`/api/mpv/${gid}/${page}/${mpvdata.k}/${mpvkey}`)).json())
        } catch (e) {
            enqueueSnackbar(`Error:${e}`, { variant: "error", transitionDuration: 1000 })
            if (ref.current) await loaddata()
        }
    }

    useEffect(() => init(), [gid, page])

    useEffect(() => {
        if (load) {
            const id = setTimeout(loaddata)
            return () => clearTimeout(id)   //这里的设计并没有用，有用的部分在于判断ref.current是否存在
        }
    }, [gid, page, load])

    return <>
        <div ref={ref} id={page.toString()}>
            {data ? <img
                loading="eager"
                className="lazyload blur-up"
                src={get_url()}
                onError={() => seterror(error + 1)}
                style={{ width: "100%", aspectRatio: parseInt(data.xres) / parseInt(data.yres) }}
            /> : <Skeleton variant="rectangular" width="100%" height="50vh" />}
        </div>
    </>
}