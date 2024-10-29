import { API } from "@/Data/EXAPI";
import { R, Top } from "@/components/push";
import { cookies } from "next/headers";
import Link from "next/link";
import { Image } from "./client";
import { Cookie } from "@/components/Cookies";
import { CacheEveryThing } from "@/Data/cache";
import { Box, Button, Container } from "@mui/material";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import BurstModeIcon from '@mui/icons-material/BurstMode';

export default async function G(props: { params: Promise<{ page_token: string, gallery_id: string }> }) {
    const params = await props.params;

    const {
        page_token,
        gallery_id
    } = params;

    const a = new API()
    if (!a.header.cookie.includes("igneous")) {
        return <R url="/login" />
    }

    const fullimg = (await cookies()).get("fullimg")?.value == "true"
    const { data, url } = await CacheEveryThing(async () => {
        const data = await a.s_info(page_token, gallery_id)
        let url: string
        if (fullimg && data.fullimg) {
            url = await a.no_redirt(data.fullimg)
        } else {
            url = data.img
        }
        return { data, url }
    }, [`s/${page_token}/${gallery_id}?fullimg=${fullimg}`], 3600)()

    const gallery = data.gallery.split("?")[0]
    const id = parseInt(gallery_id.split("-")[1])
    return <Container>
        <title>{data.title}</title>
        <div style={{ padding: 10, textAlign: 'center' }}>
            <Button LinkComponent={Link} href={data.gallery}>
                <MenuBookIcon />
            </Button>
        </div>
        <Link href={data.next}>
            <Image src={url} aspectRatio={data.imgw / data.imgh} />
        </Link>
        {/* <Box sx={{ padding: 1, textAlign: 'center', display: { xs: 'none', md: 'block' } }}>
            <Button LinkComponent={Link} href={data.first}
                startIcon={<FirstPageIcon />}>首页</Button>
            <Button LinkComponent={Link} href={data.prev}
                startIcon={<KeyboardArrowLeftIcon />}>上一页</Button>
            <Button LinkComponent={Link} href={data.gallery}>
                <MenuBookIcon />
            </Button>
            <Button LinkComponent={Link} href={data.next}
                endIcon={<KeyboardArrowRightIcon />}>下一页</Button>
            <Button LinkComponent={Link} href={data.end}
                endIcon={<LastPageIcon />}>末页</Button>
            <br />
            <Button LinkComponent={Link} href={data.imgsearch}>
                <FindInPageIcon />
            </Button>
        </Box> */}
        <Box sx={{ padding: 1, textAlign: 'center' }}>

            <Button LinkComponent={Link} href={data.prev}
                startIcon={<KeyboardArrowLeftIcon />}>上一页</Button>
            <Button LinkComponent={Link} href={data.gallery}>
                <MenuBookIcon />
            </Button>
            <Button LinkComponent={Link} href={data.next}
                endIcon={<KeyboardArrowRightIcon />}>下一页</Button>
            <br />
            <Button LinkComponent={Link} href={data.first}
                startIcon={<FirstPageIcon />}>首页</Button>
            {/* @ts-ignore */}
            <Button LinkComponent={Link} href={data.imgsearch} prefetch={false}>
                <FindInPageIcon />
            </Button>
            <Button LinkComponent={Link} href={data.end}
                endIcon={<LastPageIcon />}>末页</Button>
            <br />
            <Button LinkComponent={Link} href={`${gallery.replace("/g/", "/mpv/")}?to=${id}`}
                startIcon={<BurstModeIcon />}>
                在mpv中阅读
            </Button>
            <Button LinkComponent={Link} href={`${gallery.replace("/g/", "/spv/")}?to=${id}`}
                endIcon={<BurstModeIcon />}>
                在spv中阅读
            </Button>
        </Box>
        <Cookie c={a.cookies} />
        <Top index={page_token} />
    </Container>
}
