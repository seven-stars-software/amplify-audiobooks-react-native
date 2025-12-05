import { useMemo } from 'react';
import { MD3Theme, useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';

const useStyles = () => {
    const theme = useTheme();
    const styles = useMemo(() => createStylesheet(theme), [theme]);
    return styles;
};

const createStylesheet = (theme: MD3Theme) => {
    return StyleSheet.create({
        BGColor: {
            backgroundColor: theme.colors.background,
        },
    });
};

export default useStyles;
