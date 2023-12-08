"use client"
import { useState, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import HomeIcon from '@mui/icons-material/Home';
import StarIcon from '@mui/icons-material/Star';
import SettingsIcon from '@mui/icons-material/Settings';
// import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import LoginIcon from '@mui/icons-material/Login';
import StorageIcon from '@mui/icons-material/Storage';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import SearchIcon from '@mui/icons-material/Search';
import { ListItemIcon, SwipeableDrawer, Box, IconButton, AppBar, Drawer, Toolbar, Typography, Divider, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useRouter } from 'next/navigation';

const DRAWER_WIDTH = 240;

const LINKS = [
    { text: 'Home', href: '/i', icon: HomeIcon },
    { text: 'Search', href: '/search', icon: SearchIcon },
    { text: 'Popular', href: '/popular', icon: WhatshotIcon },
    { text: 'Subscription', href: '/watched', icon: LoyaltyIcon },
    { text: 'Favourite', href: '/favorites', icon: StarIcon },
];

const PLACEHOLDER_LINKS = [
    { text: 'Settings', href: '/settings', icon: SettingsIcon },
    { text: 'Server', href: '/extra', icon: StorageIcon },
    { text: 'Login', href: '/login', icon: LoginIcon },
    // { text: 'Logout', href: '/api/auth/signout', icon: LogoutIcon },
];

export function Root({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const [dark, setdark] = useState(false);
    let mode: "dark" | "light"
    if (dark) { mode = 'dark' } else { mode = 'light' }
    const router = useRouter()

    useEffect(() => {
        const m = localStorage.getItem('mode')
        if (m != null) { setdark(m == "true") }
    }, [])

    const theme = createTheme({
        palette: {
            mode: mode,
            ...(
                mode == "light"
                    ? {
                        primary: {
                            main: '#3f51b5',
                        },
                        secondary: {
                            main: '#f50057',
                        },
                        text: {
                            primary: "#000000",
                            // secondary: "#e5dfdf"
                        },
                    }
                    : {
                        text: {
                            primary: "#ffffff",
                            // secondary: "#1A2027"
                        },
                    }
            ),
        }
    })

    return <ThemeProvider theme={theme}>
        <AppBar position="fixed" sx={{ zIndex: 2000, minHeight: '64px' }} color='inherit'>
            <Toolbar sx={{ backgroundColor: 'palette.main', minHeight: '64px' }}>
                {/* <IconButton onClick={() => { setOpen(!open) }}>
                <MenuIcon sx={{ color: '#444', transform: 'translateY(-2px)' }} />
              </IconButton> */}
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="open drawer"
                    sx={{ mr: 2 }}
                    onClick={() => { setOpen(!open) }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div" color="inherit" onClick={() => { router.push("/") }}>
                    EX Mirror
                </Typography>
                {/* <MenuItem> */}
                <Box sx={{ flexGrow: 1 }} />
                <IconButton sx={{ ml: 1 }} onClick={() => { localStorage.setItem('mode', (!dark).toString()); setdark(!dark) }} color="inherit">
                    {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
                {/* </MenuItem> */}
            </Toolbar>
        </AppBar>
        <SwipeableDrawer onClose={() => { setOpen(false) }} onOpen={() => { setOpen(true) }} open={open}>
            <Drawer
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        top: ['56px', '64px'],
                        height: 'auto',
                        bottom: 0,
                    },
                    // display: { xs: 'none', sm: 'block' },
                }}
                variant="permanent"
                anchor="left"
                open={open}
            >
                <Divider />
                <List>
                    {LINKS.map(({ text, href, icon: Icon }) => (
                        <ListItem key={href} disablePadding>
                            <ListItemButton component={Link} href={href}>
                                <ListItemIcon>
                                    <Icon />
                                </ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Divider sx={{ mt: 'auto' }} />
                <List>
                    {PLACEHOLDER_LINKS.map(({ text, href, icon: Icon }) => (
                        <ListItem key={href} disablePadding>
                            <ListItemButton component={Link} href={href}>
                                <ListItemIcon>
                                    <Icon />
                                </ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </SwipeableDrawer>

        <Box
            component="main"
            sx={{
                flexGrow: 1,
                bgcolor: 'background.default',
                // ml: `${DRAWER_WIDTH}px`,
                mt: ['48px', '56px', '64px'],
                // p: 3,
                pt: 3,
                minHeight: "100vh"
            }}
        >
            {children}
        </Box>
    </ThemeProvider>
}