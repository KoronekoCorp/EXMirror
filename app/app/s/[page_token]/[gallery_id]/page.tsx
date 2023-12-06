import { API } from "@/Data/EXAPI";
import { R } from "@/components/push";
import { cookies } from "next/headers";
import Link from "next/link";
import { Image } from "./client";
import { Cookie } from "@/app/Cookies";
import { CacheEveryThing } from "@/Data/cache";


export default async function G({ params: { page_token, gallery_id } }: { params: { page_token: string, gallery_id: string } }) {
    const a = new API()
    if (!a.header.cookie.includes("igneous")) {
        return <R url="/login" />
    }

    const fullimg = cookies().get("fullimg")?.value == "true"
    const { data, url } = await CacheEveryThing(async () => {
        const data = await a.s_info(page_token, gallery_id)
        let url: string
        if (fullimg && data.fullimg) {
            url = await a.no_redirt(data.fullimg)
        } else {
            url = data.img
        }
        return { data, url }
    }, [`s/${page_token}/${gallery_id}?fullimg=${fullimg}`], 3600)()

    return <>
        <title>{data.title}</title>
        <ul className="breadcrumb center">
            <li>
                <Link href={data.gallery}>
                    <i className="fa fa-book" aria-hidden="true" />
                </Link>
            </li>
        </ul>
        <Image src={url} aspectRatio={data.imgw / data.imgh} />
        <ul className="breadcrumb center">
            <li>
                <Link href={data.first}>
                    <i className="fa fa-chevron-left" aria-hidden="true"></i>
                </Link>
            </li>
            <li>
                <Link href={data.prev}>
                    <i className="fa fa-chevron-left" aria-hidden="true"></i>
                </Link>
            </li>
            <li>
                <Link href={data.imgsearch}>
                    <i className="fa fa-search" aria-hidden="true" />
                </Link>
            </li>
            <li>
                <Link href={data.gallery}>
                    <i className="fa fa-book" aria-hidden="true" />
                </Link>
            </li>
            <li>
                <Link href={data.next}>
                    <i className="fa fa-chevron-right" aria-hidden="true"></i>
                </Link>
            </li>
            <li>
                <Link href={data.end}>
                    <i className="fa fa-chevron-right" aria-hidden="true"></i>
                </Link>
            </li>
        </ul>
        <Cookie c={a.cookies} />
    </>
}
