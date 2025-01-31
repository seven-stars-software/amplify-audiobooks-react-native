import MainScreenContainer from "components/atoms/MainScreenContainer";
import { topBannerHeight } from "components/atoms/TopBanner";
import BookList from "components/molecules/BookList";
import { tabBarHeight } from "components/molecules/CoreTabBar";

import { ActivityIndicator, Text } from "react-native-paper";
import { useBookStore } from "stores/BookStore";


const LibraryScreen = () => {
    const { loading, books, loadBooks } = useBookStore()
    const library = Object.values(books).filter((book) => book.purchased)


    return (
        <MainScreenContainer>
            {
                loading ?
                    (
                        <ActivityIndicator animating={true} style={{ marginTop: 40 }} />
                    ) :
                    (
                        <BookList
                            header={
                                <Text variant="headlineMedium" style={{
                                    marginTop: 20,
                                    marginBottom: 20,
                                    paddingTop: topBannerHeight,
                                    fontWeight: "900"
                                    
                                }}>Library</Text>
                            }
                            items={library}
                            onRefresh={loadBooks}
                        />
                    )
            }
        </MainScreenContainer>
    )
}

export default LibraryScreen