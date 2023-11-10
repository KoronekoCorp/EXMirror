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
                    router.push(`/favorites?favcat=all&f_search=${word}`)
                }}>
                    <i className="fa fa-folder" aria-hidden="true" /> 搜索收藏
                </button>
            </form>
        </div>
    </>
}