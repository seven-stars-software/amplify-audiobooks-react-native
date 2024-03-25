import styler from "styler/styler";
import FancyBGSource from "@assets/images/fancy-bg.png"

const FancyBG = () => {
    return(
        <FillImage source={FancyBGSource} />
    )
}

const FillImage = styler.Image({
    borderWidth: 3,
    borderColor: 'black',
    resizeMode: 'cover',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
})

export default FancyBG;