declare namespace NodeJS {
    export interface ProcessEnv {
        SITE: string
    }
}

declare interface Window {
    TOP?: { [key: string]: undefined | true }
}