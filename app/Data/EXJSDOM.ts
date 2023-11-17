import { JSDOM, ConstructorOptions } from 'jsdom'
import { Script } from 'vm'

interface tag {
    title: string
    style: string | null
}

export interface G_JSDOM_DATA {
    href: string
    src: string
    title: string
    catalog: string
    time: string
    uploader: string
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
     * @example "[House Saibai Mochi (Shiratama Moti)] Yuri Ranbou Shidoushitsu [Chinese] [Digital"]
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

    uploadercomment: string | undefined
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
    static Index(html: string | JSDOM): [G_JSDOM_DATA[], string | undefined, string | undefined] {
        const dom = EXJSDOM.GetDom(html)
        const container = dom.window.document.querySelector("table.itg.glte")
        if (!container) {
            return [[], undefined, undefined]
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
                //@ts-ignore
                tag: Array.from(gl2e[i].querySelectorAll("td div.gt")).map((e) => { return { title: e.title, style: e.getAttribute('style') } }),
                //@ts-ignore
                lowtag: Array.from(gl2e[i].querySelectorAll("td div.gtl")).map((e) => { return { title: e.title, style: e.getAttribute('style') } })
            }
            fin.push(d)
        }
        return [
            fin,
            //@ts-ignore
            dom.window.document.getElementById("dprev").href,
            //@ts-ignore
            dom.window.document.getElementById("dnext").href
        ]
    }

    /**
     * 解析画廊页面缩略图
     * @param html 
     * @returns 
     */
    static gallery_imgs(html: string | JSDOM): [string[], string[]] {
        const dom = EXJSDOM.GetDom(html)
        const all = Array.from(dom.window.document.getElementsByClassName("gdtl"))
        const urls: string[] = []
        const imgs: string[] = []
        all.forEach((e) => {
            urls.push((e.children[0] as HTMLAnchorElement).href.replace("https://exhentai.org", ""))
            imgs.push((e.children[0].children[0] as HTMLImageElement).src)
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
        const document = EXJSDOM.GetDom(html).window.document
        const data = {
            "Posted": "2021-06-22 15:39",
            "Parent": "None",
            "Visible": "Yes",
            "Language": `Chinese &nbsp;<span class="halp" title="This gallery has been translated from the original language text.">TR</span>`,
            "File Size": "462.6 MiB",
            "Length": 0,
            "Favorited": "453 times",
            catalog: document.querySelector("div#gdc")?.children[0].innerHTML,
            uploader: document.querySelector("div#gdn")?.children[0].innerHTML,
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

            uploadercomment: document.querySelector("#comment_0")?.innerHTML
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
}

export { EXJSDOM }