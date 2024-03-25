import URLS from "URLs";
import { cacheToList } from "caches/CacheUtils";
import useHomeCache from "caches/HomeCache";
import TopBanner, { TopBannerHeight } from "components/atoms/TopBanner";
import BooksSideScroll from "components/molecules/BooksSideScroll";
import useStyles from "hooks/useStyles";
import React from "react";
import { Dimensions, Linking, ScrollView, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";


const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

const HomeScreen = () => {
    const styles = useStyles()
    const insets = useSafeAreaInsets()
    const { loading, libraryBooks, featuredBooks, newReleaseBooks, onSaleBooks } = useHomeCache()
    const [libraryList, featuredList, newReleaseList, onSaleList] = [libraryBooks, featuredBooks, newReleaseBooks, onSaleBooks].map(cacheToList)

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
                    <ScrollView 
                    style={{ paddingTop: insets.top + TopBannerHeight }}
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