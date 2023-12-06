import { G_JSDOM_DATA } from "@/Data/EXJSDOM";
import Link from "next/link";
import { Image } from "./Image";
import { FavButton } from "./Gclient";

export function GDatas({ G, TR }: { G: G_JSDOM_DATA[], TR: (e: string) => string }) {
    //由于format_style导出的style中background会莫名其妙失效，采用innerhtml解决
    const format_style = (style: string) => {
        const d = style.split(";").map((e) => e.split(":"))
        const s: { [key: string]: string } = {}
        d.forEach((e) => {
            switch (e[0]) {
                case "border-color":
                    s["borderColor"] = e[1]
                    break
                case "background":
                    s["background"] = e[1].replace("!important", "")
                    break
                case "background-color":
                    s["backgroundColor"] = e[1]
                    break
                default:
                    s[e[0]] = e[1]
            }
        })
        return s
    }

    return <>
        {G.length === 0 && <p style={{ textAlign: 'center' }}>什么都没有呢</p>}
        {G.map((e) => {
            return <div className="container" style={{ paddingTop: 10 }} key={e.href}>
                <div className="card fluid">
                    <div className="row">
                        <div className="col-sm-12 col-md-3" key={e.href}>
                            <div className="section" style={{ height: 'auto', margin: '0.5rem' }}>
                                <Link href={e.href.replace("https://exhentai.org", "")} title={e.title}>
                                    <Image src={e.src.replace("s.exhentai.org", "ehgt.org")} style={{ border: '1px ridge black' }} />
                                </Link>
                            </div>
                        </div>
                        <div className="col-sm-12 col-md-8">
                            <h3>
                                <Link className="book_title_search" href={e.href.replace("https://exhentai.org", "")} title={e.title}>
                                    {e.title}
                                </Link>
                            </h3>
                            <p>
                                <b>
                                    <i className="fa fa-bars" aria-hidden="true"></i> 分类:
                                </b>{' '}
                                <Link href={`/${e.catalog.toLocaleLowerCase().replaceAll(" ", "")}`}>
                                    {e.catalog}
                                </Link>
                            </p>
                            <p>
                                <i className="fa fa-user" aria-hidden="true"></i>{' '}
                                <Link className="book_author_search" href={`/search/${e.uploader}`} title={e.uploader}>
                                    {e.uploader}
                                </Link>
                            </p>
                            <p>
                                <b>页数：</b>{e.pages}
                            </p>
                            <p>
                                {e.favname != "" && <FavButton name={e.favname} url={e.href} style={format_style(e.favstyle)} />}
                            </p>
                            <p>
                                <b>
                                    <i className="fa fa-hashtag" aria-hidden="true" />
                                </b>{" "}
                                <span id="book_tags">
                                    {e.tag.map((tag) => (
                                        //由于format_style导出的style中background会莫名其妙失效，采用innerhtml解决
                                        <Link key={e.href + tag.title} href={`/tag/${tag.title}`}
                                            dangerouslySetInnerHTML={{ __html: `<button class="shadowed small" style='${tag.style}'>${TR(tag.title)}</button>` }}>
                                        </Link>
                                    ))}
                                    {e.lowtag.map((tag) => (
                                        // <Link  key={e.href + tag.title} href={`/tag/${tag.title}`} >
                                        //     <button className="shadowed small" style={tag.style ? format_style(tag.style) : {}} >
                                        //         <div dangerouslySetInnerHTML={{ __html: TR(tag.title) }}></div>
                                        //     </button>
                                        // </Link>
                                        <Link key={e.href + tag.title} href={`/tag/${tag.title}`}
                                            dangerouslySetInnerHTML={{ __html: `<button class="shadowed small" style='${tag.style};border: 1px dashed #8c8c8c;'>${TR(tag.title)}</button>` }}>
                                        </Link>
                                    ))}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        })}
    </>
}