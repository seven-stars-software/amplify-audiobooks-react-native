import { ReactPropTypes, useEffect, useState } from "react"
import { Dimensions, Image, ImageURISource } from "react-native"

// Only allow images with URI sources
type Props = Omit<React.ComponentPropsWithRef<typeof Image>, 'source'> & {
    source: Omit<ImageURISource, 'uri'> & { uri: string },
    containerWidth: number
}

const AutoHeightImage = (props: Props) => {
    const { source, containerWidth } = props;
    const [dimensions, setDimensions] = useState<{ width: string|number, height: string|number }>();
    useEffect(() => {
        Image.getSize(
            source.uri,
            (width: number, height: number) => {
                const ratio = containerWidth / width
                setDimensions({
                    width: "100%",
                    height: height * ratio
                })
            })
    }, [])

    return (
        <Image {...props} source={source} style={{
            width: dimensions?.width,
            height: dimensions?.height
        }} />
    )
}

export default AutoHeightImage