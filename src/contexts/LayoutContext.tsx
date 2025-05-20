import { createContext, ReactNode } from "react";
import { useWindowDimensions } from "react-native";

type LayoutContextValue = {
    topBannerHeight: number
}

const LayoutContext = createContext<LayoutContextValue>({
    topBannerHeight: 150
});

export const LayoutContextProvider = ({ children }: { children?: ReactNode }) => {
    const { width, height } = useWindowDimensions();

    return(
        <LayoutContext.Provider value={{
            topBannerHeight: height/6
        }}>
            {children}
        </LayoutContext.Provider>
    )
}

export default LayoutContext;