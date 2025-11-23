import { useState } from "react"

declare module "*.png"

export type AuthSeal = string

export type Book = {
    wooProductID: string,
    name: string,
    images: string[],
    author: string,
    duration: string,
    releaseDate: string,
    dateCreated: string,
    isbn: string,
    permalink: string,
    featured: boolean,
    purchased: boolean,
    newRelease: boolean,
    onSale: boolean,
    tracks?: Track[]
}

export const enum DownloadStatus {
    DOWNLOADING = 'downloading',
    DOWNLOADED = 'downloaded',
    NOT_DOWNLOADED = 'not_downloaded',
    FAILED = 'failed'
}

export type Track = {
    isSample: boolean,
    name: string,
    s3Key: string,
    uri: string,
    downloadStatus: DownloadStatus
}

export type DefinedReactState<T> = [T, React.Dispatch<React.SetStateAction<T>>]
export type PossiblyDefinedReactState<T> = ReturnType<typeof useState<T>>