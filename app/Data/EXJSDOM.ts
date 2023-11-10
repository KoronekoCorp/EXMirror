import { JSDOM } from 'jsdom'
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


class EXJSDOM {
    static GetDom(html: string | JSDOM) {
        if (html instanceof JSDOM) {
            console.log("[DOM]")
            return html
        } else {
            console.log("[STR]")
            return new JSDOM(html, { contentType: 'text/html' })
        }
    }

    /**
     * 解析总览页面信息
     * @param html 
     * @returns 
     */
    static Index(html: string | JSDOM): [G_JSDOM_DATA[], string | undefined, string | undefined] {
        const dom = EXJSDOM.GetDom(html)
        const container = dom.window.document.querySelector("table.itg.glte") ?? new Element()

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
            //@ts-ignore
            urls.push(e.children[0].href.replace("https://exhentai.org", ""))
            //@ts-ignore
            imgs.push(e.children[0].children[0].src)
        })
        return [imgs, urls]
    }


    static setting(html: string) {
        const dom = new JSDOM(html, { contentType: 'text/html', runScripts: 'dangerously' })
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
}

export { EXJSDOM }