import { R } from "@/components/push"

export default async function Page(props: { params: Promise<{ word: string }> }) {
    const params = await props.params;

    const {
        word
    } = params;

    const url = decodeURIComponent(word).match(/\/g\/(\d*?)\/(.*)/g)
    if (url) {
        return <R url={url[0]} />
    }
    return <>
        {word}
    </>
}