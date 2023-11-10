import { API } from "@/Data/EXAPI"
import { db } from "@/Data/EXDB"
import { R } from "@/app/push"
import { GDatas } from "../GDatas"
import Link from "next/link"
import Button from "./client"

const favcolor = ["#818181", "#f83333", "#fd903b", "#fdf23f", "#2ad853", "#a5f331", "#2ce4e5", "#3b2ef4", "#9732f6", "#ce309e", "#0e0e0e"]

export default async function P({ searchParams }:
    { searchParams: { [key: string]: string } }) {

    const a = new API()
    if (!a.header.cookie.includes("igneous")) {
        return <R url="/login" />
    }
    const __tr = db.getDB()
    const __d = a.favourite(searchParams)
    const { index: [d, prev, next], fav: fav } = await __d
    console.log(fav)

    const tr = await __tr
    return <>
        <Button />
        <div className="center">
            {fav.map((i, j) => {
                if (j > 9) {
                    return <Link className="shadowed button secondary" href="favorites" style={{ backgroundColor: favcolor[j] }} key={i}>
                        显示所有收藏夹
                    </Link >
                }
                return <Link className="shadowed button secondary" href={`/favorites?favcat=${j}`} style={{ backgroundColor: favcolor[j] }} key={i}>
                    {i}
                </Link >
            })}
        </div >
        <GDatas G={d} TR={(e) => db.translate(e, tr)} />
        <div className="center">
            <div className="pagination" id="paginationSection">
                {prev && <Link href={prev.replace("https://exhentai.org/favorites.php", "/favorites")}>上一页</Link>}
                {next && <Link href={next.replace("https://exhentai.org/favorites.php", "/favorites")}>下一页</Link>}
            </div>
        </div>
    </>
}