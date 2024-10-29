import { API } from "@/Data/EXAPI"
import { db } from "@/Data/EXDB"
import { R } from "@/components/push"
import { GDatas } from "@/components/GDatas"
import Link from "next/link"
import { Button } from "@mui/material"
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { GdataTr } from "@/Data/ETools"


export default async function G(
    props:
        { params: Promise<{ tag: string }>, searchParams: Promise<{ [key: string]: string }> }
) {
    const searchParams = await props.searchParams;
    const params = await props.params;

    const {
        tag
    } = params;

    const a = new API()
    if (!a.header.cookie.includes("igneous")) {
        return <R url="/login" />
    }
    const __tr = db.getDB()
    const __d = a.index(searchParams, `https://exhentai.org/tag/${tag}`)
    const [d, prev, next, searchtext] = await __d

    const tr = await __tr
    return <>
        <title>{decodeURIComponent(tag)}</title>
        <GDatas G={GdataTr(d, tr)} searchtext={searchtext} allowSearch />
        <div style={{ padding: 10, textAlign: 'center' }}>
            {prev && <Button LinkComponent={Link} href={prev.replace("https://exhentai.org/", "/")}
                startIcon={<KeyboardArrowLeftIcon />}>上一页</Button>}
            {next && <Button LinkComponent={Link} href={next.replace("https://exhentai.org/", "/")}
                endIcon={<KeyboardArrowRightIcon />}>下一页</Button>}
        </div>
    </>
}