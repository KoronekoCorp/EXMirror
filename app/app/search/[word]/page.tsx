import { R } from "@/components/push"

export default async function Page({ params: { word } }: { params: { word: string } }) {
    const url = decodeURIComponent(word).match(/\/g\/(\d*?)\/(.*)/g)
    if (url) {
        return <R url={url[0]} />
    }
    return <>
        {word}
    </>
}