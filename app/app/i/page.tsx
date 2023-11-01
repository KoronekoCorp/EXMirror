import { API } from "@/Data/EXAPI"
import { db } from "@/Data/EXDB"
import Link from "next/link"


export default async function G({ searchParams }:
    { searchParams: { [key: string]: string } }) {

    const a = new API()
    const __tr = db.getDB()
    const d = await a.index(searchParams)

    const format_style = (style: string) => {
        const d = style.split(";").map((e) => e.split(":"))
        const s: { [key: string]: string } = {}
        d.forEach((e) => {
            s[e[0]] = e[1]
        })
        return s
    }
    const tr = await __tr
    return <>
        {d.map((e) => {
            return <div className="container" style={{ paddingTop: 10 }}>
                <div className="card fluid">
                    <div className="row">
                        <div className="col-sm-6 col-md-3" key={e.href}>
                            <div className="section" style={{ height: 'auto', margin: '0.5rem' }}>
                                <Link prefetch={false} href={e.href.replace("https://exhentai.org", "")} title={e.title}>
                                    <img
                                        style={{ border: '1px ridge black', height: '60%' }}
                                        loading="lazy"
                                        className="lazyload blur-up"
                                        data-src={e.src.replace("s.exhentai.org", "aeiljuispo.cloudimg.io/v7/https://ehgt.org")}
                                        alt={e.title}
                                    />
                                </Link>
                                <h6>
                                    <Link prefetch={false} className="book_title_search" href={e.href.replace("https://exhentai.org", "")} title={e.title}>
                                        {e.title}
                                    </Link>
                                </h6>
                                <p style={{ fontSize: '14px' }}>
                                    <i className="fa fa-user" aria-hidden="true"></i>{' '}
                                    <Link prefetch={false} className="book_author_search" href={`/search/${e.uploader}`} title={e.uploader}>
                                        {e.uploader}
                                    </Link>
                                </p>
                            </div>
                        </div>
                        <div className="col-sm-12 col-md-8">
                            <h3>
                                <Link prefetch={false} className="book_title_search" href={e.href.replace("https://exhentai.org", "")} title={e.title}>
                                    {e.title}
                                </Link>
                            </h3>
                            <p>
                                <b>
                                    <i className="fa fa-hashtag" aria-hidden="true" />
                                </b>{" "}
                                <span id="book_tags">
                                    {e.tag.map((tag) => (
                                        <Link prefetch={false} key={tag.title} href={`/tag/${tag.title}`} >
                                            <button className="shadowed small" style={tag.style ? format_style(tag.style) : {}} >
                                                <div dangerouslySetInnerHTML={{ __html: db.translate(tag.title, tr) }}></div>
                                            </button>
                                        </Link>
                                    ))}
                                </span>
                            </p>
                        </div>
                    </div>

                </div>
            </div >
        })}
    </>
}