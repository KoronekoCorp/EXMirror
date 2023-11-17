import Link from "next/link";
import style from './style.module.css'

export default function Home() {
  return (
    <>
      <div className="container" style={{ paddingTop: 10 }}>

        <div className="row">
          <div className="col-sm-12 col-md-6" style={{ height: '50vh', textAlign: 'center' }}>
            <div style={{ height: "20%" }}> </div>
            <h1>EX Mirror</h1>
            <p>一个没啥用的项目</p>
            <p>项目地址：<Link href='https://github.com/KoronekoCorp/EXMirror'>https://github.com/KoronekoCorp/EXMirror</Link></p>
          </div>
          <div className="col-sm-12 col-md-6">
            <img
              loading="lazy"
              className={`lazyload blur-up ${style.anime}`}
              data-src="https://koroneko.co/img/1.png"
            />
          </div>
        </div>
      </div>

    </>
  )
}
