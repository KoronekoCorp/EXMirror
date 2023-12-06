import { API } from "@/Data/EXAPI"
import { db } from "@/Data/EXDB"
import { R } from "@/components/push"
import { GDatas } from "../GDatas"
import Link from "next/link"


export default async function P({ searchParams }:
    { searchParams: { [key: string]: string } }) {

    const a = new API()
    if (!a.header.cookie.includes("igneous")) {
        return <R url="/login" />
    }
    const __tr = db.getDB()
    const __d = a.index(searchParams, "https://exhentai.org/cosplay")
    const [d, prev, next] = await __d

    const tr = await __tr
    return <>
        <GDatas G={d} TR={(e) => db.translate(e, tr)} />
        <div className="center">
            <div className="pagination" id="paginationSection">
                {prev && <Link href={prev.replace("https://exhentai.org/", "/")}>上一页</Link>}
                {next && <Link href={next.replace("https://exhentai.org/", "/")}>下一页</Link>}
            </div>
        </div>
    </>
}