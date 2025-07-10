"use client"

import Link from "next/link";
import style from './style.module.css'
import { GridLegacy as Grid, Container } from "@mui/material";

export default function Home() {
  return (
    <Container sx={{ paddingTop: 10, textAlign: 'center' }}>
      <Grid container>
        <Grid item xs={12} md={6}>
          <img
            loading="lazy"
            className={style.anime}
            src="https://cos.elysia.rip/1.png"
            style={{ maxWidth: "100%" }}
          />
        </Grid>
        <Grid item xs={12} md={6} sx={{ height: '100vh', color: "text.primary", width: "100%" }} >
          <div style={{ height: "20%" }}> </div>
          <h1>EX Mirror</h1>
          <p>一个没啥用的项目</p>
          <p>项目地址：<Link href='https://github.com/KoronekoCorp/EXMirror'>GITHUB</Link></p>
        </Grid>
      </Grid>
    </Container>
  )
}
