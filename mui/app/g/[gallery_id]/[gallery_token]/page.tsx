import { API } from "@/Data/EXAPI"
import { notFound } from "next/navigation"
import Link from "next/link"
import { db } from "@/Data/EXDB"
import { R, Top } from "@/app/push"
import { Cookie } from "@/app/Cookies"
import { NextPage } from "./client"
import { ginfo } from "@/Data/EXJSDOM"
import { CacheEveryThing } from "@/Data/cache"
import { cookies } from "next/headers"
import { Image } from "@/app/Image"
import { Button, Container, Grid, Rating, Stack } from "@mui/material"
import { H2 } from "@/H2"
import BurstModeIcon from '@mui/icons-material/BurstMode';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import PersonIcon from '@mui/icons-material/Person';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TagIcon from '@mui/icons-material/Tag';
import DehazeIcon from '@mui/icons-material/Dehaze';

const favcolor = ["#818181", "#f83333", "#fd903b", "#fdf23f", "#2ad853", "#a5f331", "#2ce4e5", "#3b2ef4", "#9732f6", "#ce309e", "#0e0e0e"]
const favtext = [0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0]

export default async function G({ params: { gallery_id, gallery_token }, searchParams }:
    { params: { gallery_id: string, gallery_token: string }, searchParams: { [key: string]: string | undefined } }) {
    const id = parseInt(gallery_id)
    if (id < 0) { notFound() }
    const a = new API()
    if (!a.header.cookie.includes("igneous")) {
        return <R url="/login" />
    }

    const __tr = db.getDB()
    const __thumbnail = []
    const p = parseInt(searchParams.p ?? "0")
    for (let page = 0; page <= p; page++) {
        __thumbnail.push(
            CacheEveryThing(async () => a.gallery_info(id, gallery_token, page),
                [`g/${id}/${gallery_token}?p=${page}`, `${cookies().get("ipb_member_id")}`], 86400
            )()
        )
    }

    const tr = await __tr
    const thumbnail: string[] = []
    const thumbnail_url: string[] = []
    let gdata: ginfo | undefined = undefined

    for (let i = 0; i < __thumbnail.length; i++) {
        const [r1, r2, r3] = await __thumbnail[i]
        r1.map((e) => thumbnail.push(e))
        r2.map((e) => thumbnail_url.push(e))
        if (r3) { gdata = r3 }
    }
    if (!gdata) {
        return notFound()
    }
    return <>
        <title>{gdata.gn}</title>
        <Container sx={{ paddingTop: 10, color: "text.primary" }}>
            <Grid container>
                <Grid item xs={12} md={4} sx={{ width: "100%", textAlign: 'center' }}>
                    <Image src={"https://ehgt.org" + thumbnail[0].slice(22)} style={{ width: "100%" }} />
                    <Button LinkComponent={Link} href={`/mpv/${id}/${gallery_token}`} variant="contained" sx={{ m: 1 }}
                        startIcon={<BurstModeIcon />}>
                        正统mpv阅读
                    </Button>
                    <br />
                    <Button sx={{ m: 1, backgroundColor: favcolor[(gdata.fav ?? 11) - 1], color: favtext[(gdata.fav ?? 11) - 1] ? "black" : "white" }}
                        LinkComponent={Link} href={`/g/${id}/${gallery_token}?fav=${gdata.fav}`} variant="contained"
                        startIcon={<BookmarksIcon />}>
                        {gdata.fav ? gdata.favname : "收藏"}
                    </Button>
                </Grid>
                <Grid item xs={12} md={8} sx={{ width: "100%" }}>
                    <H2>
                        {gdata.gn}
                    </H2>
                    {gdata.gj != "" && <H2>{gdata.gj}</H2>}
                    <Stack direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={2} sx={{ pt: 1 }}>
                        <PersonIcon />上传者:
                        <Button LinkComponent={Link} href={`/search/${gdata.uploader}`}>
                            {gdata.uploader}
                        </Button>
                    </Stack>
                    <Stack direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={2} sx={{ pt: 1 }}>
                        <DataUsageIcon />页数:<span style={{ marginRight: 16 }}>{gdata.Length}</span>文件大小:<span>{gdata["File Size"]}</span>
                    </Stack>
                    <Stack direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={2} sx={{ pt: 1 }}>
                        <EmojiEventsIcon />评分:
                        <Rating name="read-only" value={parseInt(gdata.Average?.replace("Average: ", "") as string)} readOnly />
                        <span style={{ marginRight: 16 }}>{gdata.Average?.replace("Average: ", "")}</span>评分次数:<span>{gdata.count}</span>
                    </Stack>
                    <Stack direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={2} sx={{ pt: 1 }}>
                        <AccessTimeIcon />发布于 {gdata.Posted}
                    </Stack>
                    <Stack direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={2} sx={{ pt: 1 }}>
                        <DehazeIcon />分类:
                        <Button LinkComponent={Link} href={`/${gdata.catalog?.toLocaleLowerCase().replaceAll(" ", "")}`}>
                            {gdata.catalog}
                        </Button>
                    </Stack>
                    <Stack direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={2} sx={{ pt: 1 }}>
                        <TagIcon />Tags:
                        <Grid container sx={{ textAlign: "center", "& > div": { m: 1 } }}>
                            {gdata.tags.map((tag) => (
                                <Grid key={tag}>
                                    <Button LinkComponent={Link} href={`/tag/${tag}`} >
                                        <div dangerouslySetInnerHTML={{ __html: db.translate(tag, tr) }}></div>
                                    </Button>
                                </Grid>
                            ))}
                            {gdata.lowtag.map((tag) => (
                                <Grid key={tag}>
                                    <Button LinkComponent={Link} href={`/tag/${tag}`} sx={{ border: "1px dashed #8c8c8c" }} >
                                        <div dangerouslySetInnerHTML={{ __html: db.translate(tag, tr) }}></div>
                                    </Button>
                                </Grid>
                            ))}
                        </Grid>
                    </Stack>
                </Grid>
            </Grid>
            <Grid container alignItems="center" textAlign="center" sx={{ "& > div": { p: 1 } }}>
                {thumbnail.map((t, index) => <Grid xs={6} md={3} key={t[0]} item>
                    <Link href={thumbnail_url[index]}>
                        <Image src={"https://ehgt.org" + t.slice(22)} style={{ width: "100%" }} />
                    </Link>
                    <br />
                    {index + 1}
                </Grid>)}
            </Grid>
            {gdata.Length > thumbnail.length && <NextPage gallery_id={gallery_id} gallery_token={gallery_token} p={p} />}
            <Cookie c={a.cookies} />
            <Top index={gallery_token} />
        </Container >
    </>
}