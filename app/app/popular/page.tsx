import { API } from "@/Data/EXAPI"
import { db } from "@/Data/EXDB"
import { R } from "@/components/push"
import { GDatas } from "../GDatas"


export default async function P({ searchParams }:
    { searchParams: { [key: string]: string } }) {

    const a = new API()
    if (!a.header.cookie.includes("igneous")) {
        return <R url="/login" />
    }
    const __tr = db.getDB()
    const __d = a.index(searchParams, "https://exhentai.org/popular")
    const [d, prev, next] = await __d

    const tr = await __tr
    return <>
        <GDatas G={d} TR={(e) => db.translate(e, tr)} />
        <div className="center">
        </div>
    </>
}