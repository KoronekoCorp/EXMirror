"use client"

import { SetBackDrop } from "@/components/BackDrop"
import { useContext, useEffect } from "react"

export function BackDrop() {
    const setopen = useContext(SetBackDrop)
    useEffect(() => {
        setopen(false)
    }, [])
    return <></>
}