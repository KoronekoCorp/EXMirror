import { translate } from "./EXDB";
import { type DBindex } from "./EXDBtype";
import { type G_JSDOM_DATA } from "./EXJSDOM";

export function GdataTr(gdata: G_JSDOM_DATA[], db: DBindex): G_JSDOM_DATA[] {
    return gdata.map(i => {
        return {
            ...i,
            tag: i.tag.map(j => {
                return {
                    style: j.style,
                    title: translate(j.title, db)
                }
            }),
            lowtag: i.lowtag.map(j => {
                return {
                    style: j.style,
                    title: translate(j.title, db)
                }
            }),
        }
    })
}