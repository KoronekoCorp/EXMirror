import type { Metadata } from 'next'
import { Heads } from './Head'
import { Header } from './Header'
import { Footer } from './Footer'
import { Suspense } from "react";
import Loading from './loading';
import Snackbar from './Snackbar';

export const metadata: Metadata = {
  title: 'Koroneko Corp',
  description: '黑猫科技,毛线球Corp',
}

export default function RootLayout({
  children,
  gfav
}: {
  children: React.ReactNode,
  gfav: React.ReactNode,
}) {
  return (
    <html lang="zh">
      <head>
        <Heads />
      </head>
      <body style={{ margin: "auto" }}>
        <Header />
        <Suspense fallback={<Loading />}>
          <Snackbar>
            {children}
          </Snackbar>
        </Suspense>
        {gfav}
        <Footer />
      </body>
    </html>
  )
}
