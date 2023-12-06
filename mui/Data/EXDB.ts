// import { readFileSync, writeFileSync } from "fs"
import { DBTR, DBindex, version } from "./EXDBtype"

class DB {
    version_hash?: string
    db?: DBTR
    dbindex?: DBindex

    constructor() {

    }

    async getDB() {
        if (this.dbindex) {
            return this.dbindex
        }
        if (this.db === undefined) {
            await this.downloadDB()
        }
        const index: DBindex = {}
        this.db?.data.forEach((e) => {
            index[e.namespace] = e
        })
        this.dbindex = index
        return this.dbindex
    }

    async downloadDB() {
        const r = await this.ver()
        if (r) {
            const db = await fetch(`https://fastly.jsdelivr.net/gh/EhTagTranslation/DatabaseReleases@${r.mirror}/db.html.json`)
            this.db = await db.json()
        }
    }

    async ver() {
        const r = await fetch("https://api.github.com/repos/ehtagtranslation/Database/releases/latest", { next: { revalidate: 86400 } })
        const ori = await r.json() as version
        const v = /<!--(.+?)-->/gis.exec(ori.body)
        if (v && v[1]) {
            return JSON.parse(v[1]) as {
                message: string, before: string, after: string, mirror: string
            }
        }
        return null
    }

    translate(key: string, dbindex: DBindex) {
        const k = key.split(":")
        try {
            return dbindex[k[0]].data[k[1]].name.replace("https://", "https://aeiljuispo.cloudimg.io/v7/https://").replace("<p>", "").replace("</p>", "")
        } catch (e) {
            return key
        }
    }
}

export function translate(key: string, dbindex: DBindex) {
    const k = key.split(":")
    try {
        return dbindex[k[0]].data[k[1]].name.replace("https://", "https://aeiljuispo.cloudimg.io/v7/https://").replace("<p>", "").replace("</p>", "")
    } catch (e) {
        return key
    }
}

const db = new DB()
setTimeout(async () => db.getDB())
export { db }