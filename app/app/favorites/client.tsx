"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"


export default function Button() {
    const router = useRouter()
    const [word, setWord] = useState("")


    return <>
        <div className="center">
            <form >
                <input
                    type="text"
                    name="q"
                    style={{ width: "45%" }}
                    placeholder="搜索收藏"
                    className="s search-input"
                    onChange={(e) => { setWord(e.target.value) }}
                />
                <button onClick={(e) => {
                    e.preventDefault()
                    const u = new URL(location.href)
                    u.searchParams.delete("next")
                    u.searchParams.delete("prev")
                    u.searchParams.set("f_search", word)
                    router.push(u.href)
                }}>
                    <i className="fa fa-folder" aria-hidden="true" /> 搜索收藏
                </button>
            </form>
        </div>
    </>
}