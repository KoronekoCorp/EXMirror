import type { Metadata } from 'next'
import { Heads } from './Head'
import { Suspense } from "react";
import Loading from './loading';
import Snackbar from './Snackbar';
import { Root } from './Drawer';
import BackDropProvider from '@/components/BackDrop';

export const metadata: Metadata = {
  title: 'Koroneko Corp',
  description: '黑猫科技,毛线球Corp',
}

export default function RootLayout({
  children,
  gfav
}: {
  children: React.ReactNode
  gfav: React.ReactNode
}) {
  return (
    <html lang="zh">
      <head>
        <Heads />
      </head>
      <body style={{ margin: "auto" }}>
        <Root>
          <BackDropProvider>
            <Snackbar>
              <Suspense fallback={<Loading />}>
                {children}
              </Suspense>
              {gfav}
            </Snackbar>
          </BackDropProvider>
        </Root>
      </body>
    </html>
  )
}
