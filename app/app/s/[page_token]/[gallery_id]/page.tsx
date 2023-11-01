import { API } from "@/Data/EXAPI";
import { R } from "@/app/push";
import { cookies } from "next/headers";
import Link from "next/link";
import { Image } from "./client";
import { Cookie } from "@/app/Cookies";


export default async function G({ params: { page_token, gallery_id } }: { params: { page_token: string, gallery_id: string } }) {
    const a = new API()
    if (!a.header.cookie.includes("igneous")) {
        return <R url="/login" />
    }
    const __r = a.s_info(page_token, gallery_id)
    const fullimg = cookies().get("fullimg")?.value == "true"


    const [title, gallery_url, src, fullimage_url, prev, next] = await __r
    let url: string
    if (fullimg) {
        url = await a.no_redirt("https://exhentai.org/fullimg/" + fullimage_url.replaceAll("amp;", ""), [`${page_token}_${gallery_id}`], 3600 * 24)
    } else {
        url = src
    }

    return <>
        <title>{title}</title>
        <ul className="breadcrumb center">
            <li>
                <Link prefetch={false} id="book_id" href={`/g/${gallery_url}`}>
                    <i className="fa fa-book" aria-hidden="true" />
                </Link>
            </li>
        </ul>
        <Image src={url} />
        <ul className="breadcrumb center">
            <li>
                <Link prefetch={false} id="book_id" href={`/s/${prev}`}>
                    <i className="fa fa-chevron-left" aria-hidden="true"></i>
                </Link>
            </li>
            <li>
                <Link prefetch={false} id="book_id" href={`/g/${gallery_url}`}>
                    <i className="fa fa-book" aria-hidden="true" />
                </Link>
            </li>
            <li>
                <Link prefetch={false} id="book_id" href={`/s/${next}`}>
                    <i className="fa fa-chevron-right" aria-hidden="true"></i>
                </Link>
            </li>
        </ul>
        <Cookie c={a.cookies} />
    </>
}
