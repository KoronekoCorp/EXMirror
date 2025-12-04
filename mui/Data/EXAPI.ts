import { updateTag } from "next/cache";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { CacheEveryThing } from "./cache";
import type { gdata, mpvdata, mpvimg } from "./EType";
import { EXJSDOM, type ginfo } from "./EXJSDOM";

class API {
    BASE = "https://s.exhentai.org/api.php"
    header = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,en-GB;q=0.6",
        "cache-control": "max-age=0",
        "sec-ch-ua": "\"Microsoft Edge\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "cookie": ""
    }
    cookies: string[] = []
    uid: string
    constructor(cookie: string, uid: string) {
        this.header.cookie = cookie
        this.uid = uid
    }

    /**
     * 本地校验
     * @returns 
     */
    check_local() {
        return this.header.cookie.includes("ipb_member_id") &&
            this.header.cookie.includes("ipb_pass_hash") &&
            this.header.cookie.includes("igneous")
    }

    async get(url: URL | string, tags: string[] | undefined, revalidate: number | false | undefined = 7200) {
        const r = await fetch(url, {
            headers: this.header,
            next: {
                revalidate: revalidate,
                tags: tags
            }
        })
        console.log(r.headers.getSetCookie())
        r.headers.getSetCookie().forEach((e) => this.cookies.push(e))
        return r
    }

    async post(data: string, tags: string[] | undefined, revalidate: number | false | undefined = 7200, useCookie: boolean = false) {
        const r = await fetch(this.BASE, {
            method: "POST",
            headers: {
                ...this.header,
                "cookie": useCookie ? this.header.cookie : "",
                "Content-Type": "application/json",
                "Content-Length": data.length.toString(),
                "Accept-Encoding": "gzip",
            },
            body: data
        })
        return r.json()
    }

    async no_redirt(url: string) {
        const r = await fetch(url,
            {
                headers: this.header, redirect: 'manual',
            }
        )
        return r.headers.get("location") ?? ""
    }

    /**
     * 画廊总览数据
     * @deprecated API不使用
     * @param glist 
     * @returns 
     */
    async gdata(glist: [number, string][]) {
        const d = {
            "method": "gdata",
            "gidlist": glist,
            "namespace": 1
        }
        return this.post(JSON.stringify(d), [`${glist.map((e) => e[0] + e[1])}`], 3600 * 24, false) as Promise<gdata>
    }


    /**
     * 画廊详细数据
     * @param gallery_id 
     * @param gallery_token 
     * @param p 
     * @returns 
     */
    async gallery_info(gallery_id: number, gallery_token: string, p: number = 0): Promise<[{ width: number; height: number; url: string; position: number; }[], string[], ginfo?]> {
        const url = p === 0 ?
            `https://exhentai.org/g/${gallery_id}/${gallery_token}/` :
            `https://exhentai.org/g/${gallery_id}/${gallery_token}/?p=${p}`
        const r = await this.get(url, [url], 3600 * 24)
        const html = await r.text()
        const dom = EXJSDOM.GetDom(html, { runScripts: 'dangerously' })
        return p === 0 ? [...EXJSDOM.gallery_imgs(dom), EXJSDOM.gallery_info(dom)] : EXJSDOM.gallery_imgs(dom)
    }

    /**
     * 获取画廊评论
     * @deprecated 已整合至gallery_info
     * @param gallery_id 
     * @param gallery_token 
     * @returns 
     */
    async gallery_comments(gallery_id: number, gallery_token: string) {
        const url = `https://exhentai.org/g/${gallery_id}/${gallery_token}/`
        const r = await this.get(url, [url], 3600 * 24)
        const html = await r.text()
        const dom = EXJSDOM.GetDom(html, { runScripts: 'dangerously' })
        return [EXJSDOM.gallery_info(dom), EXJSDOM.comments(dom)]
    }

    /**
     * 通过MPV方式获取具体信息
     * @param gallery_id 
     * @param gallery_token 
     * @returns [图片信息, mpvkey, title]
     */
    async mpv_info(gallery_id: number, gallery_token: string): Promise<[mpvdata[], string, string]> {
        const r = await this.get(`https://exhentai.org/mpv/${gallery_id}/${gallery_token}/`, [`https://exhentai.org/mpv/${gallery_id}/${gallery_token}/`], 3600 * 24)
        const html = await r.text()
        return EXJSDOM.MPVdata(html) as [mpvdata[], string, string]
    }

    /**
     * MPV获取图像
     * @param gid 
     * @param page 
     * @param imgkey 
     * @param mpvkey 
     * @returns 
     */
    async mpv_get_img(gid: number, page: number, imgkey: string, mpvkey: string) {
        const d = {
            "method": "imagedispatch",
            "gid": gid,
            "page": page,
            "imgkey": imgkey,
            "mpvkey": mpvkey
        }
        return this.post(JSON.stringify(d), [`imagedispatch_${gid}_${page}_${imgkey}`], 3600 * 24, true) as Promise<mpvimg>
    }

    /**
     * 获取源图像
     * @param gid 
     * @param page 
     * @param imgkey 
     * @param mpvkey 
     * @returns 
     */
    async mpv_full_img(gid: number, page: number, imgkey: string, mpvkey: string) {
        const d = await this.mpv_get_img(gid, page, imgkey, mpvkey)
        const r = await this.no_redirt("https://exhentai.org/" + d.lf)
        return { ...d, "i": r == "" ? d.i : r }
    }

    /**
     * 常规单页信息
     * @param page_token 
     * @param gallery_id 
     * @returns 
     */
    async s_info(page_token: string, gallery_id: string) {
        const r = await this.get(`https://exhentai.org/s/${page_token}/${gallery_id}`, [`s_${page_token}/${gallery_id}`], 3600 * 24)
        const html = await r.text()
        return EXJSDOM.sinfo(html)
    }

    /**
     * 解析标准列视图
     * @param searchParams 
     * @param endpoint 
     * @param cache 
     * @returns 
     */
    async http(searchParams: { [key: string]: string }, endpoint = "https://exhentai.org", cache = 3600) {
        const u = new URL(endpoint)
        for (let i in searchParams) {
            // if (["next", "prev", "f_search", "f_cats", "f_sh", "f_sto", "f_sfl", "f_sfu", "f_sft", "f_spf", "f_spt", "f_srdd"].includes(i)) u.searchParams.set(i, searchParams[i])
            if (!["gallery_id", "gallery_token", "type"].includes(i)) u.searchParams.set(i, searchParams[i])
        }
        const r = await this.get(u.href, [u.href], cache)
        const html = await r.text()
        return EXJSDOM.GetDom(html)
    }

    /**
     * 解析标准列视图
     * @param searchParams 
     * @param endpoint 
     * @param cache 
     * @returns 
     */
    async index(searchParams: { [key: string]: string }, endpoint = "https://exhentai.org", cache = 3600) {
        const dom = await this.http(searchParams, endpoint, cache)
        return EXJSDOM.Index(dom)
    }

    /**
     * 获取用户收藏
     * @param searchParams 
     * @returns 
     */
    async favourite(searchParams: { [key: string]: string }) {
        const dom = await this.http(searchParams, "https://exhentai.org/favorites.php")
        return {
            index: EXJSDOM.Index(dom),
            fav: EXJSDOM.fav(dom)
        }
    }


    /**
     * 获取用户设置
     * @returns 
     */
    async get_setting() {
        const r = await this.get("https://exhentai.org/uconfig.php", [`uconfig`], 180)
        const html = await r.text()
        return EXJSDOM.setting(html)
    }

    /**
     * 更改用户设置
     * @param data 
     * @returns 
     */
    async change_setting(data: string) {
        const html = await (await fetch("https://exhentai.org/uconfig.php", {
            "headers": {
                ...this.header,
                "cache-control": "max-age=0",
                "content-type": "application/x-www-form-urlencoded",
                "Referer": "https://exhentai.org/uconfig.php",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": data,
            "method": "POST"
        })).text()
        return EXJSDOM.setting(html)
    }

    /**
     * 某画廊的收藏数据
     * @param gallery_id 
     * @param gallery_token 
     * @returns 
     */
    async fav_get(gallery_id: number | string, gallery_token: string) {
        const r = (await this.get(`https://exhentai.org/gallerypopups.php?gid=${gallery_id}&t=${gallery_token}&act=addfav`,
            [`https://exhentai.org/gallerypopups.php?gid=${gallery_id}&t=${gallery_token}&act=addfav`], 3600)).text()
        return EXJSDOM.gallery_fav(await r)
    }

    /**
     * 修改画廊收藏数据
     * @param gallery_id 
     * @param gallery_token 
     * @param favcat 收藏夹序列号0~9，如果移出收藏夹则为favdel
     * @param favnote 
     * @returns 
     */
    async fav_post(gallery_id: number | string, gallery_token: string, favcat: string, favnote: string) {
        const r = await fetch(
            `https://exhentai.org/gallerypopups.php?gid=${gallery_id}&t=${gallery_token}&act=addfav`,
            {
                method: "POST",
                body: `favcat=${favcat}&favnote=${favnote}&apply=%E5%BA%94%E7%94%A8%E6%9B%B4%E6%94%B9&update=1`,
                headers: {
                    ...this.header,
                    "cache-control": "max-age=0",
                    "content-type": "application/x-www-form-urlencoded",
                    "Referer": `https://exhentai.org/gallerypopups.php?gid=${gallery_id}&t=${gallery_token}&act=addfav`,
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                }
            }
        )
        /**逻辑错位 */
        updateTag(`https://exhentai.org/gallerypopups.php?gid=${gallery_id}&t=${gallery_token}&act=addfav`)
        updateTag(`g/${gallery_id}/${gallery_token}`,)
        return r.status === 200
    }

    /**
     * 获取画廊种子列表
     * @param gallery_id 
     * @param gallery_token 
     * @returns 
     */
    async torrent(gallery_id: number | string, gallery_token: string) {
        const r = (await this.get(`https://exhentai.org/gallerytorrents.php?gid=${gallery_id}&t=${gallery_token}`,
            [`torrent-${gallery_id}${gallery_token}`], 3600)).text()
        return EXJSDOM.torrent(await r)
    }
}


class EXAPI extends API {
    rawcookie: ReadonlyRequestCookies
    constructor(rawcookie: ReadonlyRequestCookies) {
        super(rawcookie.toString(), rawcookie.get("ipb_member_id")?.value ?? "-1")
        this.rawcookie = rawcookie
    }

    async gallery_info(gallery_id: number, gallery_token: string, page: number) {
        return CacheEveryThing(async () => super.gallery_info(gallery_id, gallery_token, page),
            [`g/${gallery_id}/${gallery_token}`, `${this.uid}`, `${page}`], 86400)()
    }
}

export async function useAPI() {
    return new EXAPI(await cookies())
}

export { API };


