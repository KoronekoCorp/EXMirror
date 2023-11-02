import { JSDOM } from 'jsdom'

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

/**
 * 解析总览页面信息
 * @param html 
 * @returns 
 */
export function Index(html: string): [G_JSDOM_DATA[], string | undefined, string | undefined] {
    const dom = new JSDOM(html, { contentType: 'text/html' })
    const container = dom.window.document.querySelector("table.itg.glte") ?? new Element()

    const gl1e = container.querySelectorAll("td.gl1e")
    const gl2e = container.querySelectorAll("td.gl2e")
    const fin: G_JSDOM_DATA[] = []
    for (let i = 0; i < gl1e.length; i++) {
        const d = {
            //@ts-ignore
            href: gl1e[i].children[0].children[0].href,
            //@ts-ignore
            src: gl1e[i].children[0].children[0].children[0].src,
            title: gl2e[i].children[0].children[1].children[0].children[0].innerHTML,
            catalog: gl2e[i].children[0].children[0].children[0].innerHTML,
            time: gl2e[i].children[0].children[0].children[1].innerHTML,
            uploader: gl2e[i].children[0].children[0].children[3].children[0].innerHTML,
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