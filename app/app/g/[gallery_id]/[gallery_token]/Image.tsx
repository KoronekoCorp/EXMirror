"use client"

import { useEffect, useState } from "react"

export function Image({ src }: { src: string }) {
    const [mir, setmir] = useState<string>()
    useEffect(() => {
        setmir(localStorage.getItem("mirror") ?? "aeiljuispo.cloudimg.io")
    }, [src])

    return <>
        {mir && <img
            id="pic_cover"
            loading="lazy"
            src="/assets/images/noimg_1.jpg"
            className="lazyload blur-up"
            data-src={`https://${mir}/v7/${src}`}
        />}
    </>
}