import { Text } from 'react-native';


const styleText = (baseStyle?: React.ComponentProps<typeof Text>['style']) => {
    const WrappedComponent = ({ children, style, ...props }: React.ComponentProps<typeof Text>) =>
        <Text style={{
            ...(baseStyle as object),
            ...(style as object),
        }} {...props}  >{children}</Text>;
    return WrappedComponent;
};

export default styleText;
