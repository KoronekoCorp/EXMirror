import { G_JSDOM_DATA } from "@/Data/EXJSDOM";
import Link from "next/link";
import { Image } from "./Image";
import { Button, Typography, Grid, Card, CardActionArea, CardContent, CardActions, Container } from "@mui/material";
import DataSaverOffIcon from '@mui/icons-material/DataSaverOff';

export function GDatas({ G, TR }: { G: G_JSDOM_DATA[], TR: (e: string) => string }) {
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
                default:
                    s[e[0]] = e[1]
            }
        })
        return s
    }

    return <Container sx={{ "& > div": { m: 1 } }}>
        {G.length === 0 && <p style={{ textAlign: 'center' }}>什么都没有呢</p>}
        {G.map((e) => {
            return <Card key={e.href}>
                <CardActionArea LinkComponent={Link} href={e.href.replace("https://exhentai.org", "")}>
                    <Grid container>
                        <Grid sm={12} md={3} item>
                            <Image src={e.src.replace("s.exhentai.org", "ehgt.org")} style={{ maxWidth: "100%" }} />
                        </Grid>
                        <Grid sm={12} md={9} item>
                            <CardContent sx={{ flex: '1 0 auto' }}>
                                <Typography component="div" variant="h5">
                                    {e.title}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary" component={Link} href={`/search/${e.uploader}`} sx={{ textDecoration: 'none' }}>
                                    {e.uploader}
                                </Typography>
                                <Grid container sx={{ "& > div": { m: 1 } }}>
                                    {e.tag.map((tag) => (
                                        <Grid key={e.href + tag.title}>
                                            <Button LinkComponent={Link} href={`/tag/${tag.title}`} sx={tag.style ? format_style(tag.style) : {}} >
                                                <div dangerouslySetInnerHTML={{ __html: TR(tag.title) }}></div>
                                            </Button>
                                        </Grid>
                                    ))}
                                    {e.lowtag.map((tag) => (
                                        <Grid key={e.href + tag.title}>
                                            <Button LinkComponent={Link} href={`/tag/${tag.title}`} sx={{ border: "1px dashed #8c8c8c", ...(tag.style ? format_style(tag.style) : {}) }} >
                                                <div dangerouslySetInnerHTML={{ __html: TR(tag.title) }}></div>
                                            </Button>
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Grid>
                    </Grid>
                </CardActionArea>
                <CardActions>
                    <Button size="small" LinkComponent={Link} href={`/${e.catalog.toLocaleLowerCase().replaceAll(" ", "")}`} color="primary" startIcon={<DataSaverOffIcon />}>
                        {e.catalog}
                    </Button>
                </CardActions>
            </Card>
        })}
    </Container>
}