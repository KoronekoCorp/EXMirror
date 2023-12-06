import { API } from "@/Data/EXAPI"
import { R } from "@/components/push"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Cookie } from "@/app/Cookies"
import { MPVImages } from "./Images"
import { CacheEveryThing } from "@/Data/cache"

export default async function G({ params: { gallery_id, gallery_token }, searchParams }:
    { params: { gallery_id: string, gallery_token: string }, searchParams: { [key: string]: string | undefined } }) {
    const id = parseInt(gallery_id)
    if (id < 0) { notFound() }
    const a = new API()
    if (!a.header.cookie.includes("igneous")) {
        return <R url="/login" />
    }
    const [r, mpvkey, title] = await CacheEveryThing(async () => a.mpv_info(id, gallery_token),
        [`mpv/${id}/${gallery_token}`], 86400)()
    return <>
        <title>{title}</title>
        <ul className="breadcrumb center">
            <li>
                <Link id="book_id" href={`/g/${id}/${gallery_token}`}>
                    <i className="fa fa-book" aria-hidden="true" />
                </Link>
            </li>
        </ul>
        <h1 className="post-title detail_title book_title_search" id="book_name" itemProp="name headline">
            {title}
        </h1>
        <div className="container center" style={{ padding: 20 }}>
            {/* {r.map((e, i) => <MPVImage key={e.n} gid={id} page={i + 1} mpvdata={e} mpvkey={mpvkey} />)} */}
            <MPVImages mpvdata={r} gid={id} mpvkey={mpvkey} />
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