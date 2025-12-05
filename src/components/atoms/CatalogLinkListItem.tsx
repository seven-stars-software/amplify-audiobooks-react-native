import { Button, MD3Theme, useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';

type Props = {
    onPress?: () => void
}

const CatalogLinkListItem = ({ onPress }: Props) => {
    const theme = useTheme();
    const styles = makeStyles(theme);

    return (
        <Button
            mode="contained"
            onPress={onPress}
            style={styles.Button}
            labelStyle={[styles.ButtonText]}
        >
            Discover Books
        </Button>
    );
};

const makeStyles = (paperTheme: MD3Theme) => {
    return StyleSheet.create({
        Button: {
            margin: 4,
            backgroundColor: paperTheme.colors.primary,
        },
        ButtonText: {
            color: paperTheme.colors.onPrimary,
        },
    });
};

export default CatalogLinkListItem;
