import URLS from "URLs";
import { cacheToList } from "caches/CacheUtils";
import useHomeCache from "caches/HomeCache";
import TopBanner, { TopBannerHeight } from "components/atoms/TopBanner";
import BooksSideScroll from "components/molecules/BooksSideScroll";
import useStyles from "hooks/useStyles";
import React, { useEffect, useState } from "react";
import { Dimensions, Linking, ScrollView, View, SafeAreaView } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { useBookStore } from "stores/BookStore";
import { Book } from "types/types";


const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

type BooksByCategory = {
    libraryList: Book[]
    featuredList: Book[]
    newReleaseList: Book[]
    onSaleList: Book[]
}

const HomeScreen = () => {
    const styles = useStyles()
    const { loading, books, loadBooks } = useBookStore()

    const [
        { libraryList, featuredList, newReleaseList, onSaleList },
        setBooksByCategory
    ] = useState<BooksByCategory>({
        libraryList: [],
        featuredList: [],
        newReleaseList: [],
        onSaleList: []
    });

    //Sort books into categories when they load
    useEffect(() => {
        const libraryList: Book[] = []
        const featuredList: Book[] = []
        const newReleaseList: Book[] = []
        const onSaleList: Book[] = []
        Object.values(books).forEach((book: Book) => {
            if (book.purchased) libraryList.push(book)
            else if (book.featured) featuredList.push(book)
            else if (book.newRelease) newReleaseList.push(book)
            else if (book.onSale) onSaleList.push(book)
        })
        setBooksByCategory({ libraryList, featuredList, newReleaseList, onSaleList })
    }, [books])

    const openWebStore = () => {
        Linking.openURL(URLS.CatalogURL);
    }

    return (
        <View style={{ flex: 1, ...styles.BGColor }}>
            <TopBanner />
            {
                loading ?
                    <LoadingPlaceholder />
                    :
                    <SafeAreaView>
                        <ScrollView
                            style={{ paddingTop: TopBannerHeight + 20 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {
                                libraryList.length > 0 ?
                                    (
                                        <ListContainer>
                                            <SectionTitle>My Library</SectionTitle>
                                            <BooksSideScroll
                                                books={libraryList}
                                                booksAreInLibrary={true}
                                            />
                                        </ListContainer>
                                    )
                                    : null
                            }
                            <Button
                                mode="contained"
                                onPress={openWebStore}
                                style={{
                                    marginHorizontal: 40,
                                    marginVertical: 20
                                }}
                            >
                                Browse Web Catalog
                            </Button>
                            <ListContainer>
                                <SectionTitle>New Releases</SectionTitle>
                                <BooksSideScroll
                                    books={newReleaseList}
                                />
                            </ListContainer>
                            <ListContainer>
                                <SectionTitle>Featured</SectionTitle>
                                <BooksSideScroll
                                    books={featuredList}
                                />
                            </ListContainer>
                            <ListContainer>
                                <SectionTitle>On Sale</SectionTitle>
                                <BooksSideScroll
                                    books={onSaleList}
                                />
                            </ListContainer>
                            <View style={{ marginBottom: 200 }}></View>
                        </ScrollView>
                    </SafeAreaView>
            }

        </View>
    )
}

const LoadingPlaceholder = () => {
    return (
        <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator animating={true} size={60} />
        </View>
    )
}

const SectionTitle = ({ children }: { children: React.ComponentProps<typeof Text>['children'] }) => {
    return (
        <Text style={{ marginBottom: 10, paddingHorizontal: 20 }} variant="headlineMedium">{children}</Text>
    )
}

const ListContainer = ({ children, ...props }: React.ComponentProps<typeof View>) => {
    return <View style={{ marginBottom: 20 }} {...props} >{children}</View>
}

export default HomeScreen;