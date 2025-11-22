import { ReactNode } from "react";
import { LibraryCacheProvider } from "caches/LibraryCache";
import { FeaturedBooksCacheProvider } from "caches/FeaturedBooksCache";
import { NewReleaseBooksCacheProvider } from "caches/NewReleaseBooksCache";
import { OnSaleBooksCacheProvider } from "caches/OnSaleBooksCache";

export const CachesProvider = ({ children }: { children?: ReactNode }) => {
    return (
        <LibraryCacheProvider>
            <NewReleaseBooksCacheProvider>
                <FeaturedBooksCacheProvider>
                    <OnSaleBooksCacheProvider>
                    {children}
                    </OnSaleBooksCacheProvider>
                </FeaturedBooksCacheProvider>
            </NewReleaseBooksCacheProvider>
        </LibraryCacheProvider>
    )
}
