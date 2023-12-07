import { API } from "@/Data/EXAPI"
import { notFound } from "next/navigation"
import Link from "next/link"
import { db } from "@/Data/EXDB"
import { R } from "@/components/push"
import { Cookie } from "@/app/Cookies"
import { NextPage } from "./client"
import { ginfo } from "@/Data/EXJSDOM"
import { CacheEveryThing } from "@/Data/cache"
import { cookies } from "next/headers"
import { Image } from "@/app/Image"

const favcolor = ["#818181", "#f83333", "#fd903b", "#fdf23f", "#2ad853", "#a5f331", "#2ce4e5", "#3b2ef4", "#9732f6", "#ce309e", "#0e0e0e"]
const favtext = [0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0]

export default async function G({ params: { gallery_id, gallery_token }, searchParams }:
    { params: { gallery_id: string, gallery_token: string }, searchParams: { [key: string]: string | undefined } }) {
    const id = parseInt(gallery_id)
    if (id < 0) { notFound() }
    const a = new API()
    if (!a.header.cookie.includes("igneous")) {
        return <R url="/login" />
    }

    const __tr = db.getDB()
    const __thumbnail = []
    const p = parseInt(searchParams.p ?? "0")
    for (let page = 0; page <= p; page++) {
        __thumbnail.push(
            CacheEveryThing(async () => a.gallery_info(id, gallery_token, page),
                [`g/${id}/${gallery_token}?p=${page}`, `${cookies().get("ipb_member_id")}`], 86400
            )()
        )
    }

    const tr = await __tr
    const thumbnail: string[] = []
    const thumbnail_url: string[] = []
    let gdata: ginfo | undefined = undefined

    for (let i = 0; i < __thumbnail.length; i++) {
        const [r1, r2, r3] = await __thumbnail[i]
        r1.map((e) => thumbnail.push(e))
        r2.map((e) => thumbnail_url.push(e))
        if (r3) { gdata = r3 }
    }
    if (!gdata) {
        return notFound()
    }
    return <>
        <title>{gdata.gn}</title>
        <div className="container" style={{ paddingTop: 10 }}>
            <div className="row">
                <div className="col-sm-12 col-md-4">
                    <div className="box-colored center">
                        <Image src={"https://ehgt.org" + thumbnail[0].slice(22)} />
                        <br />
                        <button className="shadowed small tertiary">
                            <Link href={`/mpv/${id}/${gallery_token}`} className="color_white">
                                <i className="fa fa-object-ungroup" aria-hidden="true" /> 正统mpv阅读
                            </Link>
                        </button>
                        <br />
                        <button className="shadowed small tertiary">
                            <Link href={`/spv/${id}/${gallery_token}`} className="color_white">
                                <i className="fa fa-object-ungroup" aria-hidden="true" /> 特殊spv阅读
                            </Link>
                        </button>
                        <br />
                        <button className="shadowed small" style={{ backgroundColor: favcolor[(gdata.fav ?? 11) - 1], color: "black" }}>
                            <Link href={`/g/${id}/${gallery_token}?fav=true`} style={{ color: favtext[(gdata.fav ?? 11) - 1] ? "black" : "white" }}>
                                <i className="fa fa-bookmark" aria-hidden="true" /> {gdata.fav ? gdata.favname : "收藏"}
                            </Link>
                        </button>
                        <br />
                    </div>
                </div>

                <div className="col-sm-12 col-md-8">
                    <div className="box-colored">
                        <h1 className="post-title detail_title book_title_search">
                            {gdata.gn}
                        </h1>
                        {gdata.gj != "" && <h3 className="post-title detail_title book_title_search" style={{ textAlign: "center" }}>
                            {gdata.gj}
                        </h3>}
                        <p>
                            <b>
                                <i className="fa fa-user" aria-hidden="true"></i> 上传者:
                            </b>
                            <Link className="book_title_search" id="book_author" href={`/search/${gdata.uploader}`}>
                                {gdata.uploader}
                            </Link>
                        </p>
                        <p>
                            <b>
                                <i className="fa fa-circle-o-notch" aria-hidden="true"></i> 页数:
                            </b>{' '}
                            <span id="chapter_amount">{gdata.Length}</span> / <b>文件大小:</b>{' '}
                            <span id="book_total_word_count">{gdata["File Size"]}</span>
                        </p>
                        <p>
                            <b>
                                <i className="fa fa-trophy" aria-hidden="true"></i> 评分:
                            </b>{' '}
                            <span id="total_yp">{gdata.Average?.replace("Average: ", "")}</span> / <b>评分次数:</b>{' '}
                            <span id="book_total_word_count">{gdata.count}</span>
                        </p>
                        <p>
                            <b>
                                <i className="fa fa-clock-o" aria-hidden="true"></i> 发布于:
                            </b>{' '}
                            <span id="book_uptime">{gdata.Posted}</span>
                        </p>
                        <p>
                            <b>
                                <i className="fa fa-bars" aria-hidden="true"></i> 分类:
                            </b>{' '}
                            <Link href={`/${gdata.catalog?.toLocaleLowerCase().replaceAll(" ", "")}`}>
                                {gdata.catalog}
                            </Link>
                        </p>
                        <p>
                            <b>
                                <i className="fa fa-hashtag" aria-hidden="true" /> 标签:
                            </b>{" "}
                            <span id="book_tags">
                                {gdata.tags.map((tag) => (
                                    <Link key={tag} href={`/tag/${tag}`}>
                                        <button className="shadowed small" dangerouslySetInnerHTML={{ __html: db.translate(tag, tr) }}></button>
                                    </Link>
                                ))}
                                {gdata.lowtag.map((tag) => (
                                    <Link key={tag} href={`/tag/${tag}`}>
                                        <button className="shadowed small" style={{ border: "1px dashed #8c8c8c" }} dangerouslySetInnerHTML={{ __html: db.translate(tag, tr) }}></button>
                                    </Link>
                                ))}
                            </span>
                        </p>
                        {gdata.uploadercomment && <p className="detail_des">
                            <br />
                            <span id="book_description" dangerouslySetInnerHTML={{ __html: gdata.uploadercomment.replaceAll("s.exhentai.org", `aeiljuispo.cloudimg.io/v7/https://ehgt.org`).replaceAll("exhentai.org", "ex.koroneko.co") }}></span>
                        </p>}
                    </div>
                </div>
            </div>
            <br />
            <div className="row">
                {thumbnail.map((t, index) => <div className="col-sm-12 col-md-3" key={t[0]}>
                    <div className="box-colored center">
                        <Link href={thumbnail_url[index]}>
                            <Image src={"https://ehgt.org" + t.slice(22)} />
                        </Link>
                        <br />
                        {index + 1}
                    </div>
                </div>)}
            </div>
        </div>
        {gdata.Length > thumbnail.length && <NextPage gallery_id={gallery_id} gallery_token={gallery_token} p={p} />}
        <Cookie c={a.cookies} />
    </>
}