import Link from 'next/link';

import getFactoryInstance from '../ethereum/factory';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import MUILink from '@material-ui/core/Link';
import useSWR from 'swr';

import web3 from 'web3';
import { GetStaticProps } from 'next';
import { InferGetStaticPropsType } from 'next';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            minWidth: 275,
        },
        bullet: {
            display: 'inline-block',
            margin: '0 2px',
            transform: 'scale(0.8)',
        },
        title: {
            fontSize: 14,
        },
        pos: {
            marginBottom: 12,
        },
        heroContent: {
            // backgroundColor: theme.palette.background.paper,
            padding: theme.spacing(4, 0, 6),
        },
        heroButtons: {
            marginTop: theme.spacing(4),
        },
    })
);

export const factoryAddress = '0x30D23F1374a46668D1e511467a39Ea8a5DfDf62b';

const fetcher = async (address: string) => {
    try {
        const factory = getFactoryInstance(address);
        const response = await factory.methods.getDeployedFundraisers().call();
        return response
            ?.slice(0)
            .reverse()
            .map((x: any) => ({
                fundraiserAddress: x[0],
                beneficiary: x[1],
                minimum: x[2],
                name: x[3],
                target: x[4],
                deadline: x[5],
            }));
    } catch (e) {
        console.log(e);
        return [];
    }
};

export const getStaticProps: GetStaticProps = async () => {
    const fundraisers = await fetcher(factoryAddress);
    return { props: { fundraisers } };
};

export default function Home({
    fundraisers: initialData,
    drawer: { selectedIndex },
}: InferGetStaticPropsType<typeof getStaticProps>) {
    const classes = useStyles();

    const { data: fundraisers } = useSWR(factoryAddress, fetcher, {
        initialData,
        revalidateOnMount: true,
    });

    function Condition({
        beneficiary,
        deadline,
    }: {
        beneficiary: string;
        deadline: string;
    }) {
        switch (selectedIndex) {
            case 0:
                return new Date(+deadline * 1000) > new Date();
            case 1:
                return new Date(+deadline * 1000) < new Date();
            case 2:
                try {
                    return (
                        beneficiary.toUpperCase() ===
                        window.ethereum.selectedAddress.toUpperCase()
                    );
                } catch (e) {
                    console.log(e);
                    return false;
                }
            case 3:
                return true;
            default:
                console.log(`Invalid menu item ${selectedIndex}.`);
                return true;
        }
    }

    // const [fundraisers, setFundraisers] = useState(serverData.fundraisers);

    // useEffect(() => {
    //     async function loadData() {
    //         const response = await factory.methods
    //             .getDeployedFundraisers()
    //             .call();
    //         // console.log('response', response);
    //         const cleanedResponse = await response.map((x: any) => ({
    //             fundraiserAddress: x[0],
    //             beneficiary: x[1],
    //             minimum: x[2],
    //             name: x[3],
    //             target: x[4],
    //             deadline: x[5],
    //         }));
    //         setFundraisers(cleanedResponse);
    //     }

    //     if (serverData?.fundraisers == 0) {
    //         loadData();
    //     }
    // }, []);

    return (
        <div>
            {/* <div>
                <Link href="/list">List</Link>
            </div>
            <div>
                <Link href="/vehicles">Vehicles</Link>
            </div> */}
            <div className={classes.heroContent}>
                <Container maxWidth="sm">
                    <Typography
                        component="h1"
                        variant="h2"
                        align="center"
                        color="textPrimary"
                        gutterBottom
                    >
                        LifeSaver
                    </Typography>
                    <Typography
                        variant="h5"
                        align="center"
                        color="textSecondary"
                        paragraph
                    >
                        A decentralized fundraiser platform for medical
                        emergencies based on the ethereum blockchain for maximum
                        transparency. Contribute to open fundraisers or start a
                        new fundraiser if you are in a medical emergency.
                    </Typography>
                    <div className={classes.heroButtons}>
                        <Grid container spacing={2} justify="center">
                            <Grid item>
                                <Link href="/fundraiser/new" passHref>
                                    <Button variant="contained" color="primary">
                                        Start a fundraiser
                                    </Button>
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link href="/about" passHref>
                                    <Button variant="outlined" color="primary">
                                        About this project
                                    </Button>
                                </Link>
                            </Grid>
                        </Grid>
                    </div>
                </Container>
            </div>
            <Container maxWidth="lg">
                {/* <pre>{JSON.stringify(fundraisers, null, 4)}</pre> */}
                <Grid container spacing={3} justify="center">
                    <Grid item xs={12}>
                        <Typography
                            component="h2"
                            variant="h4"
                            align="center"
                            color="textPrimary"
                            gutterBottom
                        >
                            Explore fundraisers
                        </Typography>
                    </Grid>
                    {fundraisers?.map(
                        ({
                            beneficiary,
                            deadline,
                            fundraiserAddress,
                            minimum,
                            name,
                            target,
                        }: {
                            beneficiary: string;
                            deadline: string;
                            fundraiserAddress: string;
                            minimum: string;
                            name: string;
                            target: string;
                        }) =>
                            Condition({ beneficiary, deadline }) && (
                                <Grid
                                    item
                                    sm={12}
                                    md={9}
                                    lg={6}
                                    key={fundraiserAddress}
                                >
                                    <Card className={classes.root}>
                                        <CardHeader
                                            // action={
                                            //   <IconButton aria-label="settings">
                                            //     <MoreVertIcon />
                                            //   </IconButton>
                                            // }
                                            title={name}
                                            subheader={
                                                <Typography variant="caption">
                                                    by{' '}
                                                    <MUILink
                                                        href={`https://rinkeby.etherscan.io/address/${beneficiary}`}
                                                        variant="inherit"
                                                    >
                                                        {beneficiary}
                                                    </MUILink>
                                                </Typography>
                                            }
                                        />
                                        <Divider variant="middle" />
                                        <CardContent>
                                            <Typography
                                                className={classes.title}
                                                color="textSecondary"
                                                gutterBottom
                                            >
                                                {`Minimum ${web3.utils.fromWei(
                                                    minimum,
                                                    'ether'
                                                )} ether`}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                component="p"
                                                gutterBottom
                                            >
                                                Fundraiser Address:{' '}
                                                {fundraiserAddress}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                component="p"
                                                gutterBottom
                                            >
                                                {`Target ${web3.utils.fromWei(
                                                    target,
                                                    'ether'
                                                )} ether`}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                component="p"
                                            >
                                                Deadline:{' '}
                                                {new Date(
                                                    +deadline * 1000
                                                ).toLocaleString('en-IN', {
                                                    timeZoneName: 'short',
                                                    hour12: true,
                                                })}
                                            </Typography>
                                        </CardContent>
                                        <CardActions>
                                            <Link
                                                as={`/fundraiser/${fundraiserAddress}`}
                                                href="/fundraiser/[fundraiser]"
                                                passHref
                                            >
                                                <Button
                                                    size="small"
                                                    // variant="outlined"
                                                    color="primary"
                                                >
                                                    Contribute ❤
                                                </Button>
                                            </Link>
                                            <Link
                                                href={`https://rinkeby.etherscan.io/address/${fundraiserAddress}`}
                                                passHref
                                            >
                                                <Button
                                                    size="small"
                                                    color="secondary"
                                                >
                                                    View on Etherscan
                                                </Button>
                                            </Link>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            )
                    )}
                </Grid>
            </Container>
        </div>
    );
}
