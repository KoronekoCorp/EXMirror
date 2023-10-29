import { API } from "@/Data/EXAPI"
import { notFound } from "next/navigation"
import Link from "next/link"
import { db } from "@/Data/EXDB"

export default async function G({ params: { gallery_id, gallery_token } }: { params: { gallery_id: string, gallery_token: string } }) {
    const id = parseInt(gallery_id)
    if (id < 0) { notFound() }
    const a = new API()
    const __tr = db.getDB()
    const __r = a.gdata([[id, gallery_token]])
    const __thumbnail = a.gallery_info(id, gallery_token)

    const r = await __r
    const d = new Date(parseInt(r.gmetadata[0].posted) * 1000)
    const tr = await __tr
    const [thumbnail, thumbnail_url] = await __thumbnail

    return <>
        <div className="container" style={{ paddingTop: 10 }}>
            <div className="row">
                <div className="col-sm-12 col-md-4">
                    <div className="box-colored center">
                        <img
                            id="pic_cover"
                            loading="lazy"
                            src="/assets/images/noimg_1.jpg"
                            className="lazyload blur-up"
                            data-src={r.gmetadata[0].thumb.replace("s.exhentai.org", "aeiljuispo.cloudimg.io/v7/https://ehgt.org")}
                        />
                        <br />
                        <button className="shadowed small tertiary">
                            <Link href={`/book/${r.gmetadata[0].thumb}/catalog/`} className="color_white">
                                <i className="fa fa-object-ungroup" aria-hidden="true" /> 章节目录
                            </Link>
                            {/* <Prefetch url={[`/book/${r.gmetadata[0].thumb}/catalog/`]} time={1000} /> */}
                        </button>
                        <br />
                    </div>
                </div>

                <div className="col-sm-12 col-md-8">
                    <div className="box-colored">
                        <h1 className="post-title detail_title book_title_search">
                            {r.gmetadata[0].title}
                        </h1>
                        <h3 className="post-title detail_title book_title_search" style={{ textAlign: "center" }}>
                            {r.gmetadata[0].title_jpn}
                        </h3>
                        <p>
                            <b>
                                <i className="fa fa-user" aria-hidden="true"></i> 上传者:
                            </b>
                            <Link prefetch={false} className="book_title_search" id="book_author" href={`/search/${r.gmetadata[0].uploader}`}>
                                {r.gmetadata[0].uploader}
                            </Link>
                        </p>
                        <p>
                            <b>
                                <i className="fa fa-circle-o-notch" aria-hidden="true"></i> 文件总数:
                            </b>{' '}
                            <span id="chapter_amount">{r.gmetadata[0].filecount}</span> / <b>文件大小:</b>{' '}
                            <span id="book_total_word_count">{(r.gmetadata[0].filesize / 1048576).toFixed(2)}MiB</span>
                        </p>
                        <p>
                            <b>
                                <i className="fa fa-trophy" aria-hidden="true"></i> 评分:
                            </b>{' '}
                            <span id="total_yp">{r.gmetadata[0].rating}</span>
                        </p>
                        <p>
                            <b>
                                <i className="fa fa-clock-o" aria-hidden="true"></i> 发布于:
                            </b>{' '}
                            <span id="book_uptime">UTC+0 {d.getFullYear()}.{d.getMonth() + 1}.{d.getDate()} {d.getHours()}:{d.getMinutes()}</span>
                        </p>
                        <p>
                            <b>
                                <i className="fa fa-bars" aria-hidden="true"></i> 分类:
                            </b>{' '}
                            <Link prefetch={false} href={`/rank?cate=${r.gmetadata[0].category}`}>
                                {r.gmetadata[0].category}
                            </Link>
                        </p>
                        <p>
                            <b>
                                <i className="fa fa-hashtag" aria-hidden="true" /> 标签:
                            </b>{" "}
                            <span id="book_tags">
                                {r.gmetadata[0].tags.map((tag) => (
                                    <Link prefetch={false} key={tag} href={`/tag/${tag}`}>
                                        <button className="shadowed small" dangerouslySetInnerHTML={{ __html: db.translate(tag, tr) }}></button>
                                    </Link>
                                ))}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
            <br />
            <div className="row">
                {thumbnail.map((t, index) => <div className="col-sm-12 col-md-3" key={t[0]}>
                    <div className="box-colored center">
                        <Link href={`/s/${thumbnail_url[index][1]}`}>
                            <img
                                id="pic_cover"
                                loading="lazy"
                                src="/assets/images/noimg_1.jpg"
                                className="lazyload blur-up"
                                data-src={"https://aeiljuispo.cloudimg.io/v7/https://ehgt.org" + t[0].slice(27, -1)}
                            />
                        </Link>
                        <br />
                        {index + 1}
                    </div>
                </div>)}
            </div>
        </div>
    </>
}