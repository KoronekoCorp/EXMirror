import { useAPI } from "@/Data/EXAPI"
import { ginfo } from "@/Data/EXJSDOM"
import { CacheEveryThing } from "@/Data/cache"
import { H2 } from "@/H2"
import { Cookie } from "@/components/Cookies"
import { R, S, Top } from "@/components/push"
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { Box, Button, Container } from "@mui/material"
import Link from "@/components/LinkFix"
import { notFound } from "next/navigation"
import { SPVImages } from "./Images"

export default async function G(
    props:
        { params: Promise<{ gallery_id: string, gallery_token: string }>, searchParams: Promise<{ [key: string]: string | undefined }> }
) {
    const searchParams = await props.searchParams;
    const { gallery_id, gallery_token } = await props.params;

    const id = parseInt(gallery_id)
    if (id < 0) { notFound() }
    const a = await useAPI()
    if (!a.check_local()) {
        return <R url="/login" />
    }
    let page = 0
    let gdata: ginfo | undefined = undefined

    const thumbnail: { width: number; height: number; url: string; position: number; }[] = []
    const thumbnail_url: string[] = []
    do {
        const [r1, r2, r3] = await a.gallery_info(id, gallery_token, page)
        if (r3) gdata = r3
        r1.map((e) => thumbnail.push(e))
        r2.map((e) => thumbnail_url.push(e))
        page++
    } while (gdata && gdata.Length > thumbnail.length)

    if (!gdata) {
        return notFound()
    }

    return <Container>
        <title>{gdata.gn}</title>
        <Box sx={{ padding: 1, textAlign: 'center' }}>
            <Button LinkComponent={Link} href={`/g/${id}/${gallery_token}`}>
                <MenuBookIcon />
            </Button>
        </Box>
        <H2>
            {gdata.gn}
        </H2>
        <SPVImages spage={thumbnail_url} time={searchParams.to ? 5000 : 0} />
        <Box sx={{ padding: 1, textAlign: 'center' }}>
            <Button LinkComponent={Link} href={`/g/${id}/${gallery_token}`}>
                <MenuBookIcon />
            </Button>
        </Box>
        <Cookie c={a.cookies} />
        {searchParams.to ? <S index={`${gallery_id}${gallery_token}`} id={searchParams.to} /> : <Top />}
    </Container>
}