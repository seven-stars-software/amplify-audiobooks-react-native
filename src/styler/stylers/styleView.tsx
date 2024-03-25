import { JSXElementConstructor } from "react"
import { View } from "react-native"

const styleView = (baseStyle?: React.ComponentProps<typeof View>['style']) => {
    const WrappedComponent = ({ children, style, ...props }: React.ComponentProps<typeof View>) =>
        <View style={{
            ...(baseStyle as object),
            ...(style as object)
        }} {...props}  >{children}</View>
    return WrappedComponent
}

export default styleView