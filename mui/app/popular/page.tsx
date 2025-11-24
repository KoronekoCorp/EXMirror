import { GDatas } from "@/components/GDatas"
import { R } from "@/components/push"
import { GdataTr } from "@/Data/ETools"
import { useAPI } from "@/Data/EXAPI"
import { db } from "@/Data/EXDB"


export default async function P(
    props:
        { searchParams: Promise<{ [key: string]: string }> }
) {
    const searchParams = await props.searchParams;

    const a = await useAPI()
    if (!a.check_local()) {
        return <R url="/login" />
    }
    const __tr = db.getDB()
    const __d = a.index(searchParams, "https://exhentai.org/popular")
    const [d, prev, next, searchtext] = await __d

    const tr = await __tr
    return <>
        <GDatas G={GdataTr(d, tr)} searchtext={searchtext} allowSearch />
        <div style={{ padding: 10, textAlign: 'center' }}>
        </div>
    </>
}