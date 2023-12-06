import { R } from "@/components/push"
import { join } from "path"


export default async function Page({ params }: { params: { word: string[] } }) {
    let word = ""
    for (let i in params.word) {
        word = join(word, params.word[i])
    }
    const url = word.match(/\/g\/(\d*?)\/(.*)/g)
    if (url) {
        return <R url={url[0]} />
    }
    return <>
        {word}
    </>
}