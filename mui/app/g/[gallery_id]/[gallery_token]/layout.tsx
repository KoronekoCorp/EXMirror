import { Suspense } from "react"
import Loading from "@/app/loading"

export default function RootLayout({
    children,
    fav,
}: {
    children: React.ReactNode
    fav: React.ReactNode
}) {
    return <>
        <Suspense fallback={<Loading />}>
            {children}
        </Suspense>
        <Suspense fallback={<></>}>{fav}</Suspense>
    </>
}
