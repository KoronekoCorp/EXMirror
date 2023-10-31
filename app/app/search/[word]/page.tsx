import { R } from "@/app/push"

export default async function Page({ params: { word } }: { params: { word: string } }) {
    const url = word.match(/\/g\/(\d*?)\/(.*)/g)
    if (url) {
        return <R url={url[0]} />
    }
    return <>
        {word}
    </>
}