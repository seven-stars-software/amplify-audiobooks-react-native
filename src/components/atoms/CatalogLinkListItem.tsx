import { Button, MD3Theme, useTheme } from "react-native-paper"
import { Linking, StyleSheet } from "react-native";

import URLs from "URLs"

const CatalogLinkListItem = () => {
    const theme = useTheme();
    const styles = makeStyles(theme)

    const openCatalog = () => {
        Linking.openURL(URLs.CatalogURL)
    }

    return (
        <Button
            mode="contained"
            onPress={openCatalog}
            style={styles.Button}
            labelStyle={[styles.ButtonText]}
        >
            Discover Books
        </Button>
    )
}

const makeStyles = (paperTheme: MD3Theme) => {
    return StyleSheet.create({
        Button: {
            margin: 4,
            backgroundColor: paperTheme.colors.primary
        },
        ButtonText: {
            color: paperTheme.colors.onPrimary
        }
    })
}

export default CatalogLinkListItem