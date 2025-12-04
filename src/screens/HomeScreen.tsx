import URLS from "URLs";
import MainScreenContainer from "components/molecules/MainScreenContainer";
import BooksSideScroll from "components/molecules/BooksSideScroll";
import { tabBarPlusNowPlayingHeight } from "components/organisms/CoreTabBar";
import LayoutContext from "contexts/LayoutContext";
import useStyles from "hooks/useStyles";
import React, { useContext, useEffect, useState } from "react";
import { Dimensions, Linking, ScrollView, View, RefreshControl } from "react-native";
import { ActivityIndicator, Button, Text, useTheme } from "react-native-paper";
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
    const [{topBannerHeight}] = useContext(LayoutContext);
    const styles = useStyles()
    const theme = useTheme()
    const { loading, books, loadBooks } = useBookStore()
    const [refreshing, setRefreshing] = useState(false);

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

    const onRefresh = async () => {
        setRefreshing(true)
        await loadBooks()
        setRefreshing(false)
    }

    return (
        <MainScreenContainer>
            {
                loading ?
                    <LoadingPlaceholder />
                    :
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                title="Reload"
                                tintColor={theme.colors.primary}
                                titleColor={"black"}
                                progressViewOffset={topBannerHeight}
                            />
                        }
                    >
                        <ListContainer style={{ height: topBannerHeight + 20 }} />
                        {
                            libraryList.length > 0 ?
                                (
                                    <ListContainer>
                                        <SectionTitle>Library</SectionTitle>
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
                        <ListContainer style={{ height: tabBarPlusNowPlayingHeight }} />
                    </ScrollView>
            }
        </MainScreenContainer>
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
        <Text style={{
            marginBottom: 10,
            paddingHorizontal: 20,
            fontWeight: "900"
        }} variant="headlineMedium">{children}</Text>
    )
}

const ListContainer = ({ children, ...props }: React.ComponentProps<typeof View>) => {
    return <View style={{ marginBottom: 20 }} {...props} >{children}</View>
}

export default HomeScreen;