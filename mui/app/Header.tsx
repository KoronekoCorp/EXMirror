'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const Header = () => {
    const [login, setlogin] = useState(false)
    const [word, setWord] = useState("")
    const router = useRouter()
    useEffect(() => {
        if (document.cookie.includes('igneous')) {
            setlogin(true)
        }
    }, []);

    return (
        <div>
            <div className="center dark header1">
                <div style={{ padding: '10px' }}>
                    <Link href="/">
                        <img width="75px" src="/assets/images/logo.png" alt="Logo" />
                        <p className="logo_color" style={{ fontFamily: 'Fredoka One, cursive', fontSize: '25px' }}>
                            Koroneko Corp
                        </p>
                    </Link>
                </div>
            </div>
            <header className="center header_color1">
                <button className="button">
                    <i className="fa fa-folder" aria-hidden="true"></i> <Link className="header_menu1" href="/i">
                        首页
                    </Link>

                </button>
                |
                <button className="button">
                    <i className="fa fa-bar-chart" aria-hidden="true"></i> <Link className="header_menu1" href="/rank">
                        排行
                    </Link>
                </button>
                |
                <button className="button">
                    <i className="fa fa-users" aria-hidden="true"></i> <Link className="header_menu1" href="/popular">
                        热门
                    </Link>
                </button>
                |
                <button className="button">
                    <i className="fa fa-coffee" aria-hidden="true"></i> <Link className="header_menu1" href="/watched">
                        订阅
                    </Link>
                </button>
                |
                {login ?
                    <><button className="button">
                        <i className="fa fa-user-circle" aria-hidden="true"></i>{' '}
                        <Link className="header_menu1" href="/account">
                            账户
                        </Link>
                    </button>|</>
                    : <></>}
                <button className="button">
                    <i className="fa fa-sign-in" aria-hidden="true"></i> <Link className="header_menu1" href="/login">
                        登录
                    </Link>
                </button>

                |
                <button className="button">
                    <i className="fa fa-bookmark" aria-hidden="true"></i> <Link className="header_menu1" href="/favorites">
                        收藏
                    </Link>
                </button>
                |
                <button className="button">
                    <i className="fa fa-history" aria-hidden="true"></i> <Link className="header_menu1" href="/history">
                        历史
                    </Link>
                </button>
            </header>
            <main>
                <div className="center" >
                    <form id="formSearch" >
                        <input
                            type="text"
                            name="q"
                            style={{ width: '50%' }}
                            placeholder="输入您要找的作品名称 / 作者名称 / EX/EH上的鏈接"
                            className="s search-input"
                            id="searchContent"
                            onChange={(e) => { setWord(e.target.value) }}
                        />
                        <button onClick={(e) => { e.preventDefault(); router.push(`/search/${word}`) }} >
                            <i className="fa fa-search" aria-hidden="true"></i> 搜索
                        </button>
                        <button onClick={(e) => { e.preventDefault(); router.push(`/tag/${word}`) }}>
                            <i className="fa fa-tags" aria-hidden="true"></i>
                        </button>
                    </form>
                </div>
                {/* <button className="cv-btn" onClick={dichThongTinTruyen}>
                    <img src="/assets/images/translate-icon.png" width="100%" alt="Translate" />
                </button> */}
            </main>
        </div>
    );
};

export { Header };
