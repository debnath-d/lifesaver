import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import GitHubIcon from '@material-ui/icons/GitHub';
import Link from 'next/link';
import MUILink from '@material-ui/core/Link';

import Divider from '@material-ui/core/Divider';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            minHeight: '50vh',
            padding: theme.spacing(3),
        },
        padding: {
            padding: theme.spacing(2, 0, 0),
        },
    })
);

export default function About() {
    const classes = useStyles();

    return (
        <Container maxWidth="md">
            <Card elevation={4}>
                <CardContent className={classes.root}>
                    <Typography
                        component="h2"
                        variant="h4"
                        color="textPrimary"
                        gutterBottom
                    >
                        D. Debnath
                    </Typography>
                    <Divider />
                    <Typography
                        component="p"
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                        className={classes.padding}
                    >
                        I'm a final year Computer Science student.
                    </Typography>
                    <Typography
                        component="p"
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                    >
                        I love technology and open-source software. I'm an
                        active KDE and Arch Linux user.
                    </Typography>
                    <Typography
                        component="p"
                        variant="body1"
                        color="textPrimary"
                        gutterBottom
                    >
                        Visit my GitHub profile here:{' '}
                        <Link href="https://github.com/keyb0ardninja" passHref>
                            <MUILink variant="inherit">
                                https://github.com/deb947
                            </MUILink>
                        </Link>
                    </Typography>
                </CardContent>
            </Card>
        </Container>
    );
}
