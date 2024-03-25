import { ReactNode } from "react";
import { LibraryCacheProvider } from "caches/LibraryCache";
import { TracksCacheProvider } from "caches/TracksCache";
import { FeaturedBooksCacheProvider } from "caches/FeaturedBooksCache";
import { NewReleaseBooksCacheProvider } from "caches/NewReleaseBooksCache";
import { OnSaleBooksCacheProvider } from "caches/OnSaleBooksCache";

export const CachesProvider = ({ children }: { children?: ReactNode }) => {
    return (
        <LibraryCacheProvider>
            <TracksCacheProvider>
                <NewReleaseBooksCacheProvider>
                    <FeaturedBooksCacheProvider>
                        <OnSaleBooksCacheProvider>
                        {children}
                        </OnSaleBooksCacheProvider>
                    </FeaturedBooksCacheProvider>
                </NewReleaseBooksCacheProvider>
            </TracksCacheProvider>
        </LibraryCacheProvider>
    )
}
