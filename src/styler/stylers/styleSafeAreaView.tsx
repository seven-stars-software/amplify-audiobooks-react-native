import { SafeAreaView } from "react-native"


const styleSafeAreaView = (baseStyle?: React.ComponentProps<typeof SafeAreaView>['style']) => {
    const WrappedComponent = ({ children, style, ...props }: React.ComponentProps<typeof SafeAreaView>) =>
        <SafeAreaView style={{
            ...(baseStyle as object),
            ...(style as object)
        }} {...props}  >{children}</SafeAreaView>
    return WrappedComponent
}

export default styleSafeAreaView