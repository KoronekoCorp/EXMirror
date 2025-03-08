"use client"

import { CSSProperties, useEffect, useState } from "react"
import './Image.css'

export function Image({ src, style }: { src: string, style?: CSSProperties }) {
    const [mir, setmir] = useState<string>()
    useEffect(() => {
        setmir(localStorage.getItem("mirror") ?? "acodsaidap.cloudimg.io")
    }, [src])

    return <>
        {mir && <img
            loading="lazy"
            src={src.includes("hath.network") ? src : "/favicon.ico"}
            className="lazyload blur-up"
            data-src={mir ? `https://${mir}/v7/${src}` : src}
            style={style}
        />}
    </>
}