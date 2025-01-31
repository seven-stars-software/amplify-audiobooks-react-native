import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ReactNode } from 'react';
import { View } from 'react-native';
import TopBanner, { topBannerHeight } from './TopBanner';
import useStyles from 'hooks/useStyles';
import { useTheme } from 'react-native-paper';
import { nowPlayingCardHeight } from 'components/molecules/NowPlayingCard';
import { tabBarHeight } from 'components/molecules/CoreTabBar';

export type Props = {
    children: ReactNode
}

const MainScreenContainer = ({ children }: Props) => {
    const styles = useStyles();
    const theme = useTheme();
    return (
        <View style={{
            height: '100%',
            width: '100%',
            backgroundColor: theme.colors.background
        }}>
            <TopBanner />
            {children}
        </View>
    )
}

export default MainScreenContainer;