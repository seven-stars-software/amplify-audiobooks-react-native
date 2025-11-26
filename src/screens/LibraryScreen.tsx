import MainScreenContainer from "components/molecules/MainScreenContainer";
import BookList from "components/molecules/BookList";
import LayoutContext from "contexts/LayoutContext";
import { useContext } from "react";

import { ActivityIndicator, Text } from "react-native-paper";
import { useBookStore } from "stores/BookStore";


const LibraryScreen = () => {
    const [{topBannerHeight}] = useContext(LayoutContext);
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