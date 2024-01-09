import { type G_JSDOM_DATA } from "@/Data/EXJSDOM";
import Link from "next/link";
import { Image } from "./Image";
import { Button, Typography, Grid, Card, CardActionArea, CardContent, CardActions, Container, Stack } from "@mui/material";
import { Top } from "./push";
import DataSaverOffIcon from '@mui/icons-material/DataSaverOff';
import { Gbutton, Filtered } from "./Gclient";
import { Accordions } from "./Modals";
import { FullSearch } from "./AutoSearchPlus";

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

export function GDatas({ G, allowSearch, searchtext }: { G: G_JSDOM_DATA[], allowSearch?: boolean, searchtext?: { Filtered?: string, Found?: string, about?: boolean } }) {
    return <Container sx={{ "& > div": { m: 1 }, "& > p": { color: "text.primary" } }}>
        {allowSearch && <Accordions title={"Search"}>
            <FullSearch />
        </Accordions>}
        {searchtext?.Found && <p style={{ textAlign: 'center' }}>找到{searchtext.about ? "约" : ""} {searchtext?.Found} 个结果。</p>}
        {searchtext?.Filtered && <p style={{ textAlign: 'center' }}>已从此页面过滤 {searchtext?.Filtered} 个结果。<Filtered /></p>}
        {G.length === 0 && <p style={{ textAlign: 'center' }}>什么都没有呢</p>}
        {G.map((e) => {
            return <Card key={e.href}>
                <CardActionArea LinkComponent={Link} href={e.href.replace("https://exhentai.org", "")}>
                    <Grid container>
                        <Grid xs={12} md={3} item>
                            <Image src={e.src.replace("s.exhentai.org", "ehgt.org")} style={{ width: "100%" }} />
                        </Grid>
                        <Grid xs={12} md={9} item>
                            <CardContent sx={{ flex: '1 0 auto' }}>
                                <Typography component="div" variant="h5">
                                    {e.title}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary" component={Link} href={`/search/${e.uploader}`} sx={{ textDecoration: 'none' }}>
                                    {e.uploader}
                                </Typography>
                                <Stack spacing={{ xs: 1, sm: 2 }} direction="row" useFlexGap flexWrap="wrap">
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
                <CardActions sx={{ "& > a": { ml: 1, mr: 1 } }}>
                    <Button size="small" LinkComponent={Link} href={`/${e.catalog.toLocaleLowerCase().replaceAll(" ", "")}`} color="primary" startIcon={<DataSaverOffIcon />}>
                        {e.catalog}
                    </Button>
                    <Gbutton e={e} />
                </CardActions>
            </Card>
        })}
        {G.length !== 0 && <Top index={G[0].title} />}
    </Container>
}