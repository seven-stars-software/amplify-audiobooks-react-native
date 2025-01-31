import {
    MD3LightTheme as DefaultTheme,
    PaperProvider,
} from 'react-native-paper';

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        myOwnColor: '#BADA55',
        violet: "#b200ff",
        deepBlue: "#2c00ff",
        cyan: "#00eaff",
        background: "#e6e0fa",
    },
};

export default theme;