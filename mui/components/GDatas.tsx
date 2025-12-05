import { type G_JSDOM_DATA } from "@/Data/EXJSDOM";
import Link from "@/components/LinkFix";
import { Button, Card, CardActionArea, CardContent, Container, Grid, Rating, Stack, Typography } from "@mui/material";
import { FullSearch } from "./AutoSearchPlus";
import { Filtered, Gbutton } from "./Gclient";
import { Image } from "./Image";
import { Accordions } from "./Modals";
import { Top } from "./push";

//由于format_style导出的style中background会莫名其妙失效，采用innerhtml解决
const format_style = (style: string) => {
    const d = style.split(";").map((e) => e.split(":"))
    const s: { [key: string]: string } = {}
    d.forEach((e) => {
        switch (e[0]) {
            case "border-color":
                s["borderColor"] = e[1]
                break
            case "background":
                s["background"] = e[1].replace("!important", "")
                break
            case "background-color":
                s["backgroundColor"] = e[1]
                break
            default:
                s[e[0]] = e[1]
        }
    })
    return s
}
const helper_TR: { [key: string]: string } = {
    "many": "许多",
    "thousands": "数千",
    "hundreds": "数百",
}

export function GDatas({ G, allowSearch, searchtext }: { G: G_JSDOM_DATA[], allowSearch?: boolean, searchtext?: { Filtered?: string, Found?: string, about?: boolean } }) {
    return <Container sx={{ "& > div": { m: 1 }, "& > p": { color: "text.primary" } }}>
        {allowSearch && <Accordions title={"Search"}>
            <FullSearch />
        </Accordions>}
        {searchtext?.Found && <p style={{ textAlign: 'center' }}>找到{searchtext.about ? "约" : ""} {["hundreds", "thousands", "many"].includes(searchtext?.Found) ? helper_TR[searchtext?.Found] : searchtext?.Found} 个结果。</p>}
        {searchtext?.Filtered && <p style={{ textAlign: 'center' }}>已从此页面过滤 {searchtext?.Filtered} 个结果。<Filtered /></p>}
        {G.length === 0 && <p style={{ textAlign: 'center' }}>什么都没有呢</p>}
        {G.map((e) => {
            return <Card key={e.href}>
                <CardActionArea LinkComponent={Link} href={e.href.replace("https://exhentai.org", "")}>
                    <Grid container spacing={1}>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <Image src={e.src.replace("s.exhentai.org", "ehgt.org")} style={{ width: "100%" }} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 9 }}>
                            <CardContent sx={{ flex: '1 0 auto' }}>
                                <Typography component="div" variant="h5">
                                    {e.title}
                                </Typography>
                                <Stack direction="row" sx={{ p: 0 }} useFlexGap flexWrap="wrap" justifyContent="flex-start" alignItems="center" spacing={2}>
                                    <Typography component="div" variant="h6" color="text.secondary">
                                        {e.pages}  页
                                    </Typography>
                                    <Rating name="read-only" value={e.star} readOnly />
                                </Stack>
                                <Typography variant="subtitle1" color="text.secondary" component={Link} href={`/uploader/${e.uploader}`} sx={{ textDecoration: 'none' }}>
                                    {e.uploader}
                                </Typography>
                                <Typography component="div" variant="body2" color="text.secondary" sx={{ pt: 1, pb: 1 }}>
                                    发布于 {e.time}
                                </Typography>
                                {e.favtime && <Typography component="div" variant="body2" color="text.secondary" sx={{ pb: 1 }}>
                                    收藏于 {e.favtime}
                                </Typography>}
                                <Stack spacing={{ xs: 0.5, sm: 1 }} direction="row" useFlexGap flexWrap="wrap" sx={{ "img": { height: "1em" } }}>
                                    {e.tag.map((tag) => (
                                        //@ts-ignore
                                        <Button LinkComponent={Link} prefetch={false} href={`/tag/${tag.title}`} sx={tag.style ? format_style(tag.style) : {}} key={e.href + tag.title}>
                                            <div dangerouslySetInnerHTML={{ __html: tag.tr ?? tag.title }}></div>
                                        </Button>
                                    ))}
                                    {e.lowtag.map((tag) => (
                                        //@ts-ignore
                                        <Button LinkComponent={Link} prefetch={false} href={`/tag/${tag.title}`} sx={{ border: "1px dashed #8c8c8c", ...(tag.style ? format_style(tag.style) : {}) }} key={e.href + tag.title}>
                                            <div dangerouslySetInnerHTML={{ __html: tag.tr ?? tag.title }}></div>
                                        </Button>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Grid>
                    </Grid>
                </CardActionArea>
                <Gbutton e={e} />
            </Card>
        })}
        {G.length !== 0 && <Top index={G[0].title} />}
    </Container>
}