import { API } from "@/Data/EXAPI"
import { R } from "@/components/push"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Cookie } from "@/app/Cookies"
import { SPVImages } from "./Images"
import { CacheEveryThing } from "@/Data/cache"
import { type ginfo } from "@/Data/EXJSDOM"

export default async function G({ params: { gallery_id, gallery_token }, searchParams }:
    { params: { gallery_id: string, gallery_token: string }, searchParams: { [key: string]: string | undefined } }) {
    const id = parseInt(gallery_id)
    if (id < 0) { notFound() }
    const a = new API()
    if (!a.header.cookie.includes("igneous")) {
        return <R url="/login" />
    }
    let page = 0
    let gdata: ginfo | undefined = undefined

    const thumbnail: string[] = []
    const thumbnail_url: string[] = []
    do {
        const [r1, r2, r3] = await CacheEveryThing(async () => a.gallery_info(id, gallery_token, page),
            [`g/${id}/${gallery_token}?p=${page}`], 86400
        )()
        if (r3) gdata = r3
        r1.map((e) => thumbnail.push(e))
        r2.map((e) => thumbnail_url.push(e))
        page++
    } while (gdata && gdata.Length > thumbnail.length)

    if (!gdata) {
        return notFound()
    }
    return <>
        <title>{gdata.gn}</title>
        <ul className="breadcrumb center">
            <li>
                <Link id="book_id" href={`/g/${id}/${gallery_token}`}>
                    <i className="fa fa-book" aria-hidden="true" />
                </Link>
            </li>
        </ul>
        <h1 className="post-title detail_title book_title_search" id="book_name" itemProp="name headline">
            {gdata.gn}
        </h1>
        <div className="container center" style={{ padding: 20 }}>
            {/* {r.map((e, i) => <MPVImage key={e.n} gid={id} page={i + 1} mpvdata={e} mpvkey={mpvkey} />)} */}
            <SPVImages spage={thumbnail_url} />
        </div>
        <ul className="breadcrumb center">
            <li>
                <Link id="book_id" href={`/g/${id}/${gallery_token}`}>
                    <i className="fa fa-book" aria-hidden="true" />
                </Link>
            </li>
        </ul>
        <Cookie c={a.cookies} />
    </>
}