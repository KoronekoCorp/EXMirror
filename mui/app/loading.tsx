'use client'
import Skeleton from "@mui/material/Skeleton"
// import Backdrop from '@mui/material/Backdrop';
// import CircularProgress from '@mui/material/CircularProgress';

export default function Loading() {
    return (
        <Skeleton variant="rectangular" width="100%" height="100vh" />
    )
}

// export function Loading2() {
//     return <Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
//         <CircularProgress color="inherit" />
//     </Backdrop>
// }