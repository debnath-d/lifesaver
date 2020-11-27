import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Dashboard from '../components/Dashboard';
// import { UserContext } from '../utils/UserContext';
import { createMuiTheme } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';
import { AlertProps } from '@material-ui/lab/Alert';

export default function MyApp(props: AppProps) {
    const { Component, pageProps } = props;

    // const [user, setUser] = useState('');

    let darkModePreference = false;
    if (process.browser) {
        const userPreference = localStorage.getItem('userPreference');

        if (typeof userPreference === 'string') {
            darkModePreference = JSON.parse(userPreference).darkMode;
        }
    }

    const [darkMode, setDarkMode] = useState(darkModePreference);
    const [selectedIndex, setSelectedIndex] = useState(3);
    const [message, setMessage] = useState<{
        severity: AlertProps['severity'];
        message: string;
        openMessage: boolean;
    }>({
        severity: undefined,
        message: '',
        openMessage: false,
    });

    // Create a theme instance.
    const theme = createMuiTheme({
        palette: {
            primary: {
                main: darkMode ? '#90caf9' : '#556cd6',
            },
            secondary: {
                main: darkMode ? '#80cbc4' : '#19857b',
            },
            error: {
                main: red.A400,
            },
            type: darkMode ? 'dark' : 'light',
        },
    });

    // console.log({ pageProps });

    useEffect(() => {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector('#jss-server-side');
        if (jssStyles) {
            jssStyles.parentElement!.removeChild(jssStyles);
        }

        // async function getCurrentUser() {
        //     try {
        //         const response = await fetch('http://localhost:8000/signin/', {
        //             credentials: 'include',
        //         });
        //         const data = await response.json();
        //         if (data.user !== 'AnonymousUser') {
        //             setUser(data.user);
        //         }
        //     } catch (e) {
        //         console.log(e);
        //     }
        // }
        // console.log('user mounted');

        // getCurrentUser();
    }, []);

    return (
        <>
            <Head>
                <title>LifeSaver</title>
                <meta
                    name="viewport"
                    content="minimum-scale=1, initial-scale=1, width=device-width"
                />
            </Head>
            <ThemeProvider theme={theme}>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline />
                {/* <UserContext.Provider value={{ user, setUser }}> */}
                <Dashboard
                    paletteType={{ darkMode, setDarkMode }}
                    message={{ message, setMessage }}
                    drawer={{ selectedIndex, setSelectedIndex }}
                >
                    <Component
                        {...pageProps}
                        message={{ message, setMessage }}
                        drawer={{ selectedIndex, setSelectedIndex }}
                    />
                </Dashboard>
                {/* </UserContext.Provider> */}
            </ThemeProvider>
        </>
    );
}
