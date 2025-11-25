import { GdataTr } from "@/Data/ETools"
import { useAPI } from "@/Data/EXAPI"
import { db } from "@/Data/EXDB"
import { GDatas } from "@/components/GDatas"
import { R } from "@/components/push"
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { Button } from "@mui/material"
import Link from "@/components/LinkFix"


export default async function G(
    props:
        { params: Promise<{ uploader: string }>, searchParams: Promise<{ [key: string]: string }> }
) {
    const searchParams = await props.searchParams;
    const { uploader } = await props.params;

    const a = await useAPI()
    if (!a.check_local()) {
        return <R url="/login" />
    }
    const __tr = db.getDB()
    const __d = a.index(searchParams, `https://exhentai.org/uploader/${uploader}`)
    const [d, prev, next, searchtext] = await __d

    const tr = await __tr
    return <>
        <title>{decodeURIComponent(uploader)}</title>
        <GDatas G={GdataTr(d, tr)} searchtext={searchtext} allowSearch />
        <div style={{ padding: 10, textAlign: 'center' }}>
            {prev && <Button LinkComponent={Link} href={prev.replace("https://exhentai.org/", "/")}
                startIcon={<KeyboardArrowLeftIcon />}>上一页</Button>}
            {next && <Button LinkComponent={Link} href={next.replace("https://exhentai.org/", "/")}
                endIcon={<KeyboardArrowRightIcon />}>下一页</Button>}
        </div>
    </>
}