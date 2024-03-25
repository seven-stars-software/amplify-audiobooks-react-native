import styleImage from "./stylers/styleImage";
import stylePressable from "./stylers/stylePressable";
import styleSafeAreaView from "./stylers/styleSafeAreaView";
import styleText from "./stylers/styleText";
import styleView from "./stylers/styleView";


const styler = {
    SafeAreaView: styleSafeAreaView,
    View: styleView,
    Text: styleText,
    Image: styleImage,
    Pressable: stylePressable
}

export default styler;