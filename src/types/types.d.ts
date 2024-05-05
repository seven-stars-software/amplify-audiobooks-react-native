import { useState } from "react"

declare module "*.png"

type AuthSeal = string

type Book = {
    wooProductID: string,
    name: string,
    images: string[],
    author: string,
    duration: string,
    releaseDate: string,
    isbn: string,
    permalink: string
}

type Track = {
    isSample: boolean,
    number?: number,
    name: string,
    s3Key: string,
    uri: string,
    downloadStatus: 'downloading'|'downloaded'|'not_downloaded',
    localURI?: string
}

type DefinedReactState<T> = [T, React.Dispatch<React.SetStateAction<T>>] 
type PossiblyDefinedReactState<T> = ReturnType<typeof useState<T>>