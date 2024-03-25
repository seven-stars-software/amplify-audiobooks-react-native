import styler from "styler/styler";

import { SafeAreaView } from "react-native";
import FancyBG from "components/atoms/FancyBG";

type Props = {
    children: React.ReactNode
}
const Banner = ({ children }: Props) => {
    return (
        <Container>
            <FancyBG />
            <SafeAreaView>
                {children}
            </SafeAreaView>
        </Container>
    )
}

const Container = styler.View({
    height: 200,
    width: '120%',

    display: "flex",
    alignItems: "center",

    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    overflow: 'hidden',
})

export default Banner;