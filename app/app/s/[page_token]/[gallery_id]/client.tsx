"use client"

import { Skeleton } from "@mui/material"
import { useState } from "react"

export function Image({ src }: { src: string }) {
    const [isloaded, setload] = useState(false)

    return <>
        <img
            id="pic_cover"
            loading="lazy"
            className="lazyload blur-up"
            data-src={"https://aeiljuispo.cloudimg.io/" + src}
            onLoad={() => setload(true)}
            style={{ width: "100%" }}
        />
        {!isloaded && <Skeleton variant="rectangular" width="100%" height="800px" />}
    </>
}