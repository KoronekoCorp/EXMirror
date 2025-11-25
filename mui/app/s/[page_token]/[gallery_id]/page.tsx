import { Cookie } from "@/components/Cookies";
import Link from "@/components/LinkFix";
import { R, Top } from "@/components/push";
import { CacheEveryThing } from "@/Data/cache";
import { useAPI } from "@/Data/EXAPI";
import BurstModeIcon from '@mui/icons-material/BurstMode';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Box, Button, Container } from "@mui/material";
import { Image } from "./client";

export default async function G(props: { params: Promise<{ page_token: string, gallery_id: string }> }) {
    const { page_token, gallery_id } = await props.params;

    const a = await useAPI()
    if (!a.check_local()) {
        return <R url="/login" />
    }

    const fullimg = a.rawcookie.get("fullimg")?.value == "true"
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
