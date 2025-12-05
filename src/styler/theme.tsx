import {
    MD3LightTheme as DefaultTheme,
} from 'react-native-paper';

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        myOwnColor: '#BADA55',
        violet: '#b200ff',
        deepBlue: '#2c00ff',
        cyan: '#00eaff',
        background: '#efeaff',
        defaultBackground: DefaultTheme.colors.background,
    },
};

export default theme;
