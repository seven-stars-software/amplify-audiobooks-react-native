
import {AntDesign} from "@react-native-vector-icons/ant-design";
import { Text, TransformsStyle, View } from "react-native";

type Props = {
    direction?: 'forward' | 'backward',
    increment?: number,
    iconProps: Omit<React.ComponentProps<typeof AntDesign>, 'name'>
}

const JumpIcon = ({ direction = 'forward', increment = 15, iconProps }: Props) => {

    // Icon component's size defaults to 12 if not specified
    // https://github.com/oblador/react-native-vector-icons#properties
    let size = iconProps.size
    if(size === undefined) size = 12

    // We're adapting a non-ideal svg icon for our purposes with transforms
    const transforms: TransformsStyle['transform'] = []
    if (direction === 'backward') transforms.push({ rotateY: '180deg' })
    transforms.push({ rotateZ: '40deg' }, {translateY: -(size/12)})

    return (
        <View style={{position: 'relative', justifyContent: 'center', alignItems:'center'}}>
            <AntDesign style={[{}, {
                transform: transforms
            }]} name="reload" {...iconProps} />
            <Text style={{position: 'absolute', fontSize: size/3, color: String(iconProps.color), }}>{increment}</Text>
        </View>
    )
}

export default JumpIcon