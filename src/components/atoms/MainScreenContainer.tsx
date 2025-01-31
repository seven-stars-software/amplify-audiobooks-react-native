import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ReactNode } from 'react';
import { View } from 'react-native';
import TopBanner, { topBannerHeight } from './TopBanner';
import useStyles from 'hooks/useStyles';
import { useTheme } from 'react-native-paper';

export type Props = {
    children: ReactNode
}

const MainScreenContainer = ({ children }: Props) => {
    const styles = useStyles();
    const theme = useTheme();
    const bottomTabBarHeight = useBottomTabBarHeight();
    return (
        <View style={{
            height: '100%',
            width: '100%',

            marginBottom: bottomTabBarHeight,
            backgroundColor: theme.colors.background
        }}>
            <TopBanner />
            {children}

        </View>
    )
}

export default MainScreenContainer;