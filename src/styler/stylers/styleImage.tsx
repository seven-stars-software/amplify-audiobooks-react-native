import { Image } from "react-native"


const styleImage = (baseStyle?: React.ComponentProps<typeof Image>['style']) => {
    const WrappedComponent = ({ style, ...props }: React.ComponentProps<typeof Image>) =>
        <Image style={{
            ...(baseStyle as object),
            ...(style as object)
        }} {...props}  />
    return WrappedComponent
}

export default styleImage