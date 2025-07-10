import { API } from "@/Data/EXAPI"
import { db } from "@/Data/EXDB"
import { R } from "@/components/push"
import { GDatas } from "@/components/GDatas"
import Link from "next/link"
import { Cookie } from "@/components/Cookies"
import { Button, Container, GridLegacy as Grid } from "@mui/material"
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { GdataTr } from "@/Data/ETools"
import { AutoSearch } from "@/components/AutoSearch"

const favcolor = ["#818181", "#f83333", "#fd903b", "#fdf23f", "#2ad853", "#a5f331", "#2ce4e5", "#3b2ef4", "#9732f6", "#ce309e", "#0e0e0e"]
const favtext = [0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0]

export default async function P(
    props:
        { searchParams: Promise<{ [key: string]: string }> }
) {
    const searchParams = await props.searchParams;

    const a = new API()
    if (!a.header.cookie.includes("igneous")) {
        return <R url="/login" />
    }
    const __tr = db.getDB()
    const { index: [d, prev, next], fav: fav } = await a.favourite(searchParams)

    const tr = await __tr

    return <Container>
        <AutoSearch />
        <Grid container sx={{ textAlign: 'center', "& > div": { m: 1 } }} textAlign="center" justifyContent="center">
            {fav.map((i, j) => {
                if (j > 9) {
                    return <Grid key={i} xs={"auto"} item>
                        <Button LinkComponent={Link} href="favorites" sx={{ backgroundColor: favcolor[j], color: favtext[j] ? "black" : "white" }} >
                            显示所有收藏夹
                        </Button>
                    </Grid>
                }
                return <Grid key={i} xs={"auto"} item>
                    <Button LinkComponent={Link} href={`/favorites?favcat=${j}`} sx={{ backgroundColor: favcolor[j], color: favtext[j] ? "black" : "white" }} >
                        {i}
                    </Button>
                </Grid>
            })}
        </Grid>
        <GDatas G={GdataTr(d, tr)} />
        <div style={{ padding: 10, textAlign: 'center' }}>
            {prev && <Button LinkComponent={Link} href={prev.replace("https://exhentai.org/favorites.php", "/favorites")}
                startIcon={<KeyboardArrowLeftIcon />}>上一页</Button>}
            {next && <Button LinkComponent={Link} href={next.replace("https://exhentai.org/favorites.php", "/favorites")}
                endIcon={<KeyboardArrowRightIcon />}>下一页</Button>}
        </div>
        <Cookie c={a.cookies} />
    </Container>
}