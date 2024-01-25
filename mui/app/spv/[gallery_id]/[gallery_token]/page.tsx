import { API } from "@/Data/EXAPI"
import { ginfo } from "@/Data/EXJSDOM"
import { CacheEveryThing } from "@/Data/cache"
import { R, S, Top } from "@/components/push"
import { notFound } from "next/navigation"
import { Box, Button, Container } from "@mui/material"
import MenuBookIcon from '@mui/icons-material/MenuBook';
import Link from "next/link"
import { H2 } from "@/H2"
import { Cookie } from "@/components/Cookies"
import { SPVImages } from "./Images"

export default async function G({ params: { gallery_id, gallery_token }, searchParams }:
    { params: { gallery_id: string, gallery_token: string }, searchParams: { [key: string]: string | undefined } }) {
    const id = parseInt(gallery_id)
    if (id < 0) { notFound() }
    const a = new API()
    if (!a.header.cookie.includes("igneous")) {
        return <R url="/login" />
    }
    let page = 0
    let gdata: ginfo | undefined = undefined

    const thumbnail: string[] = []
    const thumbnail_url: string[] = []
    do {
        const [r1, r2, r3] = await CacheEveryThing(async () => a.gallery_info(id, gallery_token, page),
            [`g/${id}/${gallery_token}?p=${page}`], 86400
        )()
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