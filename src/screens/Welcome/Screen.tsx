import TopBanner from "components/atoms/TopBanner"
import { ReactNode } from "react"
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useTheme, DefaultTheme } from "react-native-paper"

type Props = {
    children: ReactNode
}
const Screen = ({children}: Props) => {
    const theme = useTheme()

    return (
        <View style={{
            backgroundColor: theme.colors.background,
            flex: 1,
        }}>
            <TopBanner />
            {children}
        </View>
    )
}

export default Screen