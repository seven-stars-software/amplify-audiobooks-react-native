import { Pressable } from 'react-native';

const stylePressable = (baseStyle?: React.ComponentProps<typeof Pressable>['style']) => {
    const WrappedComponent = ({ style, ...props }: React.ComponentProps<typeof Pressable>) =>
        <Pressable style={{
            ...(baseStyle as object),
            ...(style as object),
        }} {...props}  />;
    return WrappedComponent;
};

export default stylePressable;
