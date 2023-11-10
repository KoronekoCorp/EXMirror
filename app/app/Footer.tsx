"use client"
import Link from 'next/link'
import Script from 'next/script'
import style from './style.module.css'

export const Footer = () => (
    <>
        <a className={style.footerbutton} onClick={() => { document.body.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' }) }}>
            <i className={`${style.footerbuttonin} fa fa-arrow-up`}></i>
        </a>

        <footer className="center footer1">
            <p>
                <Link href="/settings">
                    <span style={{ color: "#fff" }}>
                        <i className="fa fa-cogs" aria-hidden="true" /> 设置
                    </span>
                </Link>{" "}
                <Link href="/extra">
                    <span style={{ color: "#fff" }}>
                        <i className="fa fa-server" aria-hidden="true" /> 服务器信息
                    </span>
                </Link>{" "}
            </p>
            <p>
                <i className="fa fa-gamepad" aria-hidden="true" /> 2023-2023 | Made with Love and Koroneko
            </p>
            {/* <Script src="/assets/js/main.js"></Script> */}
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js"></Script>
        </footer>
    </>

)
