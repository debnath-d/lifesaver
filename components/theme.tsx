import { createMuiTheme } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';

const prefersDarkMode = true;

// Create a theme instance.
const theme = createMuiTheme({
    palette: {
        primary: {
            main: prefersDarkMode ? '#90caf9' : '#556cd6',
        },
        secondary: {
            main: prefersDarkMode ? '#009688' : '#19857b',
        },
        error: {
            main: red.A400,
        },
        type: prefersDarkMode ? 'dark' : 'light',
    },
});

export default theme;
