import TopBanner from 'components/organisms/TopBanner';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

type Props = {
    children: ReactNode
}
const Screen = ({children}: Props) => {
    const theme = useTheme();

    return (
        <View style={{
            backgroundColor: theme.colors.background,
            flex: 1,
        }}>
            <TopBanner />
            {children}
        </View>
    );
};

export default Screen;
