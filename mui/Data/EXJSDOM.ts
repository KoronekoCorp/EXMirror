import { JSDOM, ConstructorOptions } from 'jsdom'
import { Script } from 'vm'

interface tag {
    title: string
    style: string | null
    tr?: string
}

export interface G_JSDOM_DATA {
    href: string
    src: string
    title: string
    catalog: string
    time: string
    uploader: string
    pages: number
    /**
     * @example ""
     */
    favname: string
    favstyle: string
    tag: tag[]
    lowtag: tag[]
}

export interface ginfo {
    /** 发布时间 */
    "Posted": string
    "Parent": string
    /**
     * @example "Yes"
     */
    "Visible": string,
    /**
     * @example `Chinese &nbsp;<span class="halp" title="This gallery has been translated from the original language text.">TR</span>`
     */
    "Language": string
    "File Size": string
    /**
     * 文件总数
     * @example "383 pages"
     */
    "Length": number
    /**
     * @example "453 times"
     */
    "Favorited": string,
    catalog: string | undefined
    uploader: string | undefined
    tags: string[]
    lowtag: string[]
    /**
     * 画廊均分
     * @example "Average: 4.11"
     */
    Average: string | undefined
    /**
     * 评分总数
     */
    count: string | undefined
    /**
     * @example "[House Saibai Mochi (Shiratama Moti)] Yuri Ranbou Shidoushitsu [Chinese] [Digital]"
     */
    gn: string | undefined
    /**
     * @example "[ハウス栽培もち (白玉もち)] 百合乱暴指導室 [中国翻訳]"
     */
    gj: string | undefined
    /**
     * 收藏夹序号
     */
    fav: number | undefined
    favname: string | undefined
    uploadercomment: string | undefined
    comments: {
        apikey: any;
        apiuid: any;
        data: {
            name: string;
            text: string;
            score: string;
            scorelog: string;
            editlog?: string;
            id: string;
        }[];
    }
}

function Replace(str: string) {
    return str.replaceAll("s.exhentai.org", `aeiljuispo.cloudimg.io/v7/https://ehgt.org`).replaceAll("exhentai.org", process.env.SITE)
}

class EXJSDOM {
    static GetDom(html: string | JSDOM, option?: ConstructorOptions) {
        if (html instanceof JSDOM) {
            console.log("[DOM]")
            return html
        } else {
            console.log("[STR]")
            return new JSDOM(html, { contentType: 'text/html', ...option })
        }
    }

    /**
     * 解析总览页面信息
     * @param html 
     * @returns 
     */
    static Index(html: string | JSDOM): [G_JSDOM_DATA[], string | undefined, string | undefined, { Filtered?: string, Found?: string, about?: boolean } | undefined] {
        const dom = EXJSDOM.GetDom(html)
        const container = dom.window.document.querySelector("table.itg.glte")
        if (!container) {
            return [[], undefined, undefined, undefined]
        }
        const gl1e = container.querySelectorAll("td.gl1e")
        const gl2e = container.querySelectorAll("td.gl2e")
        const fin: G_JSDOM_DATA[] = []
        for (let i = 0; i < gl1e.length; i++) {
            // console.log(gl2e[i].children[0].children[0].children[3].innerHTML)
            const d = {
                //@ts-ignore
                href: gl1e[i].children[0].children[0].href,
                //@ts-ignore
                src: gl1e[i].children[0].children[0].children[0].src,
                title: gl2e[i].children[0].children[1].children[0].children[0].innerHTML,
                catalog: gl2e[i].children[0].children[0].children[0].innerHTML,
                time: gl2e[i].children[0].children[0].children[1].innerHTML,
                uploader: gl2e[i].children[0].children[0].children[3].children[0]?.innerHTML ?? "(已放弃)",
                pages: parseInt(gl2e[i].children[0].children[0].children[4].innerHTML),
                favname: (gl2e[i].children[0].children[0].children[1] as HTMLDivElement).title,
                favstyle: gl2e[i].children[0].children[0].children[1].getAttribute('style') ?? "",
                //@ts-ignore
                tag: Array.from(gl2e[i].querySelectorAll("td div.gt")).map((e) => { return { title: e.title, style: e.getAttribute('style') } }),
                //@ts-ignore
                lowtag: Array.from(gl2e[i].querySelectorAll("td div.gtl")).map((e) => { return { title: e.title, style: e.getAttribute('style') } })
            }
            fin.push(d)
        }
        const searchtext = dom.window.document.querySelector("div.searchtext p")?.innerHTML.split(" ")
        const _search_Found = searchtext?.findIndex(i => i == "Found")
        const _search_about = searchtext?.find(i => i == "about")
        const _search_Filtered = searchtext?.findIndex(i => i == "Filtered")
        return [
            fin,
            //@ts-ignore
            dom.window.document.getElementById("dprev").href,
            //@ts-ignore
            dom.window.document.getElementById("dnext").href,
            (searchtext && (_search_Filtered || _search_Found)) ? {
                about: (_search_about ? true : false),
                ...((_search_Filtered !== undefined && _search_Filtered > -1) && { 'Filtered': searchtext[_search_Filtered + 1] }),
                ...((_search_Found !== undefined && _search_Found > -1) && { 'Found': searchtext[_search_Found + 1 + (_search_about ? 1 : 0)] })
            } : undefined
        ]
    }

    /**
     * 解析画廊页面缩略图
     * @param html 
     * @returns 
     */
    static gallery_imgs(html: string | JSDOM): [{ width: number; height: number; url: string; position: number; }[], string[]] {
        const dom = EXJSDOM.GetDom(html)
        const all = Array.from((dom.window.document.getElementById("gdt") as HTMLElement).children) as HTMLAnchorElement[]
        const urls: string[] = []
        const imgs: { width: number; height: number; url: string; position: number; }[] = []
        all.forEach((e) => {
            urls.push(e.href.replace("https://exhentai.org", ""))

            const imgdata = e.innerHTML.match(/width:(\d*)px;height:(\d*)px;background:transparent url\((.*?)\) (.*?) 0 no-repeat/)
            //@ts-ignore
            imgs.push({ width: parseInt(imgdata[1]), height: parseInt(imgdata[2]), url: imgdata[3], position: parseInt(imgdata[4]) })
        })
        return [imgs, urls]
    }

    /**
     * 解析画廊页面
     * @param html 
     * @returns 
     */
    static gallery_info(html: string | JSDOM): ginfo {
        /** 用于转换得到收藏夹序号 */
        const tr: {
            '0px -2px': 1,
            '0px -21px': 2,
            '0px -40px': 3,
            '0px -59px': 4,
            '0px -78px': 5,
            '0px -97px': 6,
            '0px -116px': 7,
            '0px -135px': 8,
            '0px -154px': 9,
            '0px -173px': 10,
            [key: string]: number | undefined,
            undefined: undefined,
        } = {
            '0px -2px': 1,
            '0px -21px': 2,
            '0px -40px': 3,
            '0px -59px': 4,
            '0px -78px': 5,
            '0px -97px': 6,
            '0px -116px': 7,
            '0px -135px': 8,
            '0px -154px': 9,
            '0px -173px': 10,
            undefined: undefined
        }
        const dom = EXJSDOM.GetDom(html)
        const document = dom.window.document
        const data = {
            "Posted": "2021-06-22 15:39",
            "Parent": "None",
            "Visible": "Yes",
            "Language": `Chinese &nbsp;<span class="halp" title="This gallery has been translated from the original language text.">TR</span>`,
            "File Size": "462.6 MiB",
            "Length": 0,
            "Favorited": "453 times",
            catalog: document.querySelector("div#gdc")?.children[0].innerHTML,
            uploader: document.querySelector("div#gdn")?.children[0]?.innerHTML ?? "(已放弃)",
            tags: [...document.querySelectorAll("div.gt")].map((e) => e.id.replace('td_', '').replaceAll("_", " ")),
            lowtag: [...document.querySelectorAll("div.gtl")].map((e) => e.id.replace('td_', '').replaceAll("_", " ")),
            /**
             * 画廊均分
             * @example Average: 4.11
             */
            Average: document.querySelector("td#rating_label")?.innerHTML,
            /**
             * 评分总数
             */
            count: document.querySelector("#rating_count")?.innerHTML,
            /**
             * @example [House Saibai Mochi (Shiratama Moti)] Yuri Ranbou Shidoushitsu [Chinese] [Digital]
             */
            gn: document.querySelector("#gn")?.innerHTML,
            /**
             * @example [ハウス栽培もち (白玉もち)] 百合乱暴指導室 [中国翻訳]
             */
            gj: document.querySelector("#gj")?.innerHTML,
            /**
             * 收藏夹序号
             */
            fav: tr[(document.querySelectorAll("div.i")[0] as HTMLDivElement)?.style.getPropertyValue('background-position')],
            favname: document.querySelector("#favoritelink")?.innerHTML,
            uploadercomment: document.querySelector("#comment_0")?.innerHTML,
            comments: EXJSDOM.comments(dom)
        }


        //提取Posted ~ Favorited的数据
        //@ts-ignore 
        const b = [...document.querySelectorAll("tbody")[0].children].map((e) => { data[e.children[0].innerHTML.replace(":", "")] = e.children[1].innerHTML })
        data.Length = parseInt(data.Length as any)
        return data
    }


    static setting(html: string) {
        const dom = EXJSDOM.GetDom(html, { runScripts: 'dangerously' })
        //原始方式无法访问数据
        // const d = new FormData(dom.window.document.forms[1])
        // dom.window.eval(`window.d=new FormData(document.forms[1])`)
        const s = new Script(`window.d=new FormData(document.forms[1])`)
        const vmContext = dom.getInternalVMContext();
        s.runInContext(vmContext)
        return Array.from(dom.window.d) as [string, FormDataEntryValue][]
    }

    /**
     * 获取收藏顶栏信息
     * @param html 
     * @returns [收藏夹url,收藏夹信息][]
     */
    static fav(html: string | JSDOM): string[] {
        const dom = EXJSDOM.GetDom(html)
        const all = Array.from(dom.window.document.querySelectorAll("div.fp"))

        return all.map((e) => { return e.children[2]?.innerHTML })
    }

    /**
     * MPV数据
     * @param html 
     * @returns [图片信息, mpvkey, title]
     */
    static MPVdata(html: string | JSDOM) {
        const dom = EXJSDOM.GetDom(html, { runScripts: 'dangerously' })
        return [dom.window.imagelist, dom.window.mpvkey, dom.window.document.title.replace("- ExHentai.org", "")]
    }

    /**
     * 某画廊的收藏数据
     * @param html 
     */
    static gallery_fav(html: string | JSDOM) {
        const dom = EXJSDOM.GetDom(html)
        const f = dom.window.document.querySelector("div.nosel") as HTMLDivElement
        return {
            favs: Array.from(f.children).map((i) => i.children[2].innerHTML).slice(0, 10),
            selectid: Array.from(f.children).slice(0, 10).map((i) => (i.children[0].children[0] as HTMLInputElement).checked).findIndex((i) => i),
            favmsg: dom.window.document.querySelector("textarea")?.value
        }
    }

    /**
     * 解析s/gid/gtoken的页面信息
     * @param html 
     */
    static sinfo(html: string | JSDOM) {
        const dom = EXJSDOM.GetDom(html)
        const t = Array.from(dom.window.document.querySelectorAll("div div div a")) as HTMLAnchorElement[]
        const img = dom.window.document.querySelector("img#img") as HTMLImageElement
        return {
            title: dom.window.document.title,
            img: img.src,
            imgh: parseInt(img.style.getPropertyValue("height")),
            imgw: parseInt(img.style.getPropertyValue("width")),
            first: t[0].href.replace("https://exhentai.org", ""),
            prev: t[1].href.replace("https://exhentai.org", ""),
            next: t[2].href.replace("https://exhentai.org", ""),
            end: t[3].href.replace("https://exhentai.org", ""),
            gallery: t[8].href.replace("https://exhentai.org", ""),
            fullimg: t[11]?.href,
            imgsearch: t[9].href.replace("https://exhentai.org/", "/i")
        }
    }

    /**
     * 获取画廊评论
     * @param html 
     * @returns 
     */
    static comments(html: string | JSDOM) {
        const dom = EXJSDOM.GetDom(html, { runScripts: 'dangerously' })
        const document = dom.window.document
        let all: Element[]
        if (document.querySelectorAll("div.c1").length == document.querySelectorAll("div.c5").length) {
            all = Array.from(document.querySelectorAll("div.c1"))
        } else {
            all = Array.from(document.querySelectorAll("div.c1")).slice(1)
        }
        const fin = all.map((i) => {
            return {
                name: i.children[0].children[0].children[0].innerHTML,
                text: Replace(i.children[1].innerHTML),
                score: i.children[0].children[2].children[0].innerHTML,
                scorelog: i.querySelector(".c7")?.innerHTML as string,
                editlog: i.querySelector(".c8")?.innerHTML,
                id: i.children[1].id.replace("comment_", "")
            }
        })
        return {
            apikey: dom.window.apikey,
            apiuid: dom.window.apiuid,
            data: fin
        }
    }
}

export { EXJSDOM }