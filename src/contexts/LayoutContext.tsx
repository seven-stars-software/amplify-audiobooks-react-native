import { createContext, Dispatch, ReactNode, useState } from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Layout = {
    topBannerHeight: number
}

type LayoutContextValue = [Layout, Dispatch<React.SetStateAction<Layout>>]

const LayoutContext = createContext<LayoutContextValue>([
    {
        topBannerHeight: 150
    },
    ()=>{
        throw new Error("LayoutContext must be used with LayoutContextProvider")
    }
]);

export const LayoutContextProvider = ({ children }: { children?: ReactNode }) => {
    const [layout, setLayout] = useState<Layout>({
        topBannerHeight: 150
    });

    return(
        <LayoutContext.Provider value={[layout, setLayout]}>
            {children}
        </LayoutContext.Provider>
    )
}

export default LayoutContext;