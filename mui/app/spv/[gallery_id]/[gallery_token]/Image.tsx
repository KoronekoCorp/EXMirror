"use client"

import { useContext, useEffect, useRef, useState } from "react";
import { Control } from "./Control";
import { Skeleton } from "@mui/material";
import { enqueueSnackbar } from "notistack";

interface api {
    data: {
        title: string;
        img: string;
        imgh: number;
        imgw: number;
        first: string;
        prev: string;
        next: string;
        end: string;
        gallery: string;
        fullimg: string;
        imgsearch: string;
    };
    url: string;
}

export function SPVImage({ spage, page, load, time }: { spage: string, page: number, load: boolean, time?: number }) {
    const control = useContext(Control)

    const ref = useRef<HTMLDivElement | null>(null)
    const [data, setdata] = useState<api>()
    const [error, seterror] = useState(0)
    const mirror = localStorage.getItem("mirror") ?? "aeiljuispo.cloudimg.io"

    const get_url = (): string => {
        switch (error) {
            case 0:
                return `https://${mirror}/v7/` + data?.url
            case 1:
                return data?.url ?? ""
            default:
                return "https://static.sirin.top/" + data?.url
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
            setdata(await (await fetch(`/api${spage}`)).json())
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
    }, [spage, page, load])

    return <>
        <div ref={ref} id={page.toString()}>
            {data ? <img
                loading="eager"
                className="lazyload blur-up"
                src={get_url()}
                onError={() => seterror(error + 1)}
                style={{ width: "100%", aspectRatio: data.data.imgw / data.data.imgh }}
            /> : <Skeleton variant="rectangular" width="100%" height="50vh" />}
        </div>
    </>
}