"use client"

import Cookies from "js-cookie";
import { useEffect } from "react";

export function Cookie({ c }: { c: string[] }) {
    useEffect(() => {
        c.forEach((e) => {
            console.log(e)
            const [key, value] = e.split(";")[0].split("=")
            // Cookies.set(key, value, { maxAge: 31536000 })
            document.cookie = `${key}=${value}; max-age=604800; path=/`;
        })
    }, [c])
    return <></>
}