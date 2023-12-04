"use client"

import Link from "next/link";
import style from './style.module.css'
import { Grid, Container } from "@mui/material";

export default function Home() {
  return (
    <Container sx={{ paddingTop: 10, textAlign: 'center' }}>
      <Grid container>
        <Grid item sm={12} md={6}>
          <img
            loading="lazy"
            className={style.anime}
            src="https://koroneko.co/img/1.png"
            style={{ maxWidth: "100%" }}
          />
        </Grid>
        <Grid item sm={12} md={6} sx={{ height: '100vh', color: "text.primary" }} >
          <div style={{ height: "20%" }}> </div>
          <h1>EX Mirror</h1>
          <p>一个没啥用的项目</p>
          <p>项目地址：<Link href='https://github.com/KoronekoCorp/EXMirror'>https://github.com/KoronekoCorp/EXMirror</Link></p>
        </Grid>
      </Grid>
    </Container>
  )
}
