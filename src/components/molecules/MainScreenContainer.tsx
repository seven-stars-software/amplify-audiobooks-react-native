import { ReactNode } from 'react';
import { View } from 'react-native';
import TopBanner from 'components/organisms/TopBanner';
import { useTheme } from 'react-native-paper';


export type Props = {
    children: ReactNode
}

const MainScreenContainer = ({ children }: Props) => {
    const theme = useTheme();
    return (
        <View style={{
            height: '100%',
            width: '100%',
            backgroundColor: theme.colors.background,
        }}>
            <TopBanner />
            {children}
        </View>
    );
};

export default MainScreenContainer;
