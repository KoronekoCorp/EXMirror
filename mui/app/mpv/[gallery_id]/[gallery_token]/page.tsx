import { useAPI } from "@/Data/EXAPI"
import { CacheEveryThing } from "@/Data/cache"
import { H2 } from "@/H2"
import { Cookie } from "@/components/Cookies"
import { R, S, Top } from "@/components/push"
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { Box, Button, Container } from "@mui/material"
import Link from "@/components/LinkFix"
import { notFound } from "next/navigation"
import { MPVImages } from "./Images"

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
    const [r, mpvkey, title] = await CacheEveryThing(async () => a.mpv_info(id, gallery_token),
        [`mpv/${id}/${gallery_token}`], 86400)()

    return <Container>
        <title>{title}</title>
        <Box sx={{ padding: 1, textAlign: 'center' }}>
            <Button LinkComponent={Link} href={`/g/${id}/${gallery_token}`}>
                <MenuBookIcon />
            </Button>
        </Box>
        <H2>
            {title}
        </H2>
        <MPVImages mpvdata={r} gid={id} mpvkey={mpvkey} time={searchParams.to ? 5000 : 0} />
        <Box sx={{ padding: 1, textAlign: 'center' }}>
            <Button LinkComponent={Link} href={`/g/${id}/${gallery_token}`}>
                <MenuBookIcon />
            </Button>
        </Box>
        <Cookie c={a.cookies} />
        {searchParams.to ? <S index={`${gallery_id}${gallery_token}`} id={searchParams.to} /> : <Top />}
    </Container>
}