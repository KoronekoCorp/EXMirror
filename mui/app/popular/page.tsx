import { API } from "@/Data/EXAPI"
import { db } from "@/Data/EXDB"
import { R } from "@/components/push"
import { GDatas } from "@/components/GDatas"
import { GdataTr } from "@/Data/ETools"


export default async function P({ searchParams }:
    { searchParams: { [key: string]: string } }) {

    const a = new API()
    if (!a.header.cookie.includes("igneous")) {
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