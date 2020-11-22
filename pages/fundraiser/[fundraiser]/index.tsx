import { useRouter } from 'next/router';
import getFundraiserInstance from '../../../ethereum/fundraiser';
import { useState } from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import ContributeForm from '../../../components/ContributeForm';
import Grid from '@material-ui/core/Grid';
import LinearProgress, {
    LinearProgressProps,
} from '@material-ui/core/LinearProgress';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import CircularProgress from '@material-ui/core/CircularProgress';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import web3 from 'web3';
import { enableBrowserWeb3 } from '../../../ethereum/web3';
import {
    GetStaticPaths,
    GetStaticProps,
    GetStaticPropsContext,
    NextPageContext,
} from 'next';
import useSWR, { trigger } from 'swr';
import Head from 'next/head';
import getFactoryInstance from '../../../ethereum/factory';
import { factoryAddress } from '../..';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        buttonProgress: {
            color: theme.palette.secondary.main,
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: -12,
            marginLeft: -12,
        },
    })
);

function LinearProgressWithLabel(
    props: LinearProgressProps & { value: number }
) {
    return (
        <Box display="flex" alignItems="center">
            <Box width="100%" mr={1}>
                <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box minWidth={35}>
                <Typography
                    variant="body2"
                    color="textSecondary"
                >{`${Math.round(props.value)}%`}</Typography>
            </Box>
        </Box>
    );
}

interface FundraiserProps {
    name: string;
    minimumContribution: string;
    balance: string;
    contributorsCount: string;
    target: string;
    deadline: number;
    beneficiary: string;
    ended: Boolean;
    success: Boolean;
}

const fetcher = async (address: string | undefined) => {
    try {
        const fundraiserInstance = getFundraiserInstance(address);
        const response = await fundraiserInstance.methods.getSummary().call();

        // console.log(response);
        const {
            0: name,
            1: minimumContribution,
            2: balance,
            3: contributorsCount,
            4: target,
            5: deadline,
            6: beneficiary,
            7: ended,
            8: success,
        }: {
            0: string;
            1: string;
            2: string;
            3: string;
            4: string;
            5: string;
            6: string;
            7: Boolean;
            8: Boolean;
        } = response;

        return {
            name,
            minimumContribution: web3.utils.fromWei(
                minimumContribution,
                'ether'
            ),
            balance: web3.utils.fromWei(balance, 'ether'),
            contributorsCount,
            target: web3.utils.fromWei(target, 'ether'),
            deadline: Number(deadline) * 1000,
            beneficiary,
            ended,
            success,
        };
    } catch (e) {
        console.log(e);
        return {
            name: '',
            minimumContribution: '',
            balance: '',
            contributorsCount: '',
            target: '',
            deadline: 0,
            beneficiary: '',
            ended: false,
            success: false,
        };
    }
};

export const getStaticProps: GetStaticProps = async ({
    params,
}: GetStaticPropsContext) => {
    const fundraiserAddress = params?.fundraiser as string;
    const fundraiser: FundraiserProps = await fetcher(fundraiserAddress);
    return { props: { fundraiser } };
};

export const getStaticPaths: GetStaticPaths = async () => {
    let paths;
    try {
        const factory = getFactoryInstance(factoryAddress);
        const response = await factory.methods.getDeployedFundraisers().call();
        // console.log('response', response);
        paths = response.map((x: any) => ({
            params: {
                fundraiser: x[0],
            },
        }));
    } catch (e) {
        console.log(e);
        paths = [];
    }

    return {
        fallback: false,
        paths,
    };
};

export default function Detail({
    fundraiser: initialData,
    message: { setMessage },
}: {
    fundraiser: any;
    message: any;
}) {
    const classes = useStyles();
    const router = useRouter();
    // console.log({ initialData });
    // console.log({ setMessage });

    const { data: fundraiser } = useSWR(
        String(router.query.fundraiser),
        fetcher,
        {
            initialData,
            revalidateOnMount: true,
        }
    );

    const [endingFundraiser, setEndingFundraiser] = useState(false);

    const handleEndFundraiser = async () => {
        const fundraiserInstance = getFundraiserInstance(
            router.query.fundraiser
        );
        setEndingFundraiser(true);
        try {
            await enableBrowserWeb3(true);

            const accounts = await window.ethereum.request({
                method: 'eth_accounts',
            });

            const result = await fundraiserInstance.methods
                .endFundraiser()
                .send({
                    from: accounts[0],
                });

            await trigger(String(router.query.fundraiser));
        } catch (error) {
            setMessage({
                openMessage: true,
                severity: 'error',
                message: error.message,
            });
        }
        setEndingFundraiser(false);
    };

    const progress = (raised: number, target: number) =>
        target > raised ? (raised / target) * 100 : 100;

    return (
        <>
            <Head>
                <title>{fundraiser?.name}</title>
            </Head>
            <Container maxWidth="lg">
                <Grid container spacing={5} justify="center">
                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardHeader
                                title={fundraiser?.name}
                                subheader={
                                    <Typography variant="subtitle1">
                                        by{' '}
                                        <Link
                                            href={`https://rinkeby.etherscan.io/address/${fundraiser?.beneficiary}`}
                                            variant="inherit"
                                        >
                                            {fundraiser?.beneficiary}
                                        </Link>
                                    </Typography>
                                }
                            />
                            <Divider variant="middle" />

                            <CardContent>
                                <Typography
                                    variant="caption"
                                    color="textSecondary"
                                    gutterBottom
                                >
                                    Minimum Contribution:{' '}
                                    {fundraiser?.minimumContribution} ether
                                </Typography>
                                <Typography variant="body2" component="p">
                                    <Typography
                                        display="inline"
                                        variant="overline"
                                    >
                                        Fundraiser Address:{' '}
                                    </Typography>
                                    <Link
                                        href={`https://rinkeby.etherscan.io/address/${router.query.fundraiser}`}
                                        variant="inherit"
                                    >
                                        {router.query.fundraiser}
                                    </Link>
                                </Typography>
                                <Typography variant="body2" component="p">
                                    <Typography
                                        display="inline"
                                        variant="overline"
                                    >
                                        Deadline:{' '}
                                    </Typography>
                                    {new Date(
                                        fundraiser ? fundraiser.deadline : 0
                                    ).toLocaleString('en-IN', {
                                        timeZoneName: 'short',
                                        hour12: true,
                                    })}
                                </Typography>
                            </CardContent>
                            {!fundraiser?.ended &&
                                Date.now() < (fundraiser?.deadline || 0) && (
                                    <CardActions>
                                        <Button
                                            size="small"
                                            color="secondary"
                                            variant="outlined"
                                            onClick={handleEndFundraiser}
                                            disabled={endingFundraiser}
                                        >
                                            End Fundraiser
                                            {endingFundraiser && (
                                                <CircularProgress
                                                    color="inherit"
                                                    size={24}
                                                    className={
                                                        classes.buttonProgress
                                                    }
                                                />
                                            )}
                                        </Button>
                                    </CardActions>
                                )}
                        </Card>
                    </Grid>

                    {!fundraiser?.ended ? (
                        Date.now() > (fundraiser?.deadline || 0) ? (
                            <Grid item xs={12} md={4}>
                                <Card>
                                    <CardHeader title="Deadline has passed" />
                                    <CardContent>
                                        <Typography
                                            variant="body2"
                                            component="p"
                                        >
                                            {Number(fundraiser?.balance) <
                                            Number(fundraiser?.target)
                                                ? Number(
                                                      fundraiser?.contributorsCount
                                                  ) > 0
                                                    ? `This fundraiser failed to achieve its target of ${fundraiser?.target}\u00a0ether. Please end it to refund the ${fundraiser?.contributorsCount}\u00a0contributor(s).`
                                                    : `This fundraiser failed to achieve its target of ${fundraiser?.target}\u00a0ether. Please end it to refund the contributor(s).`
                                                : `This fundraiser has successfully achieved its target! Please end it to transfer the raised money to the benficiary.`}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            color="secondary"
                                            variant="outlined"
                                            onClick={handleEndFundraiser}
                                            disabled={endingFundraiser}
                                        >
                                            End Fundraiser
                                            {endingFundraiser && (
                                                <CircularProgress
                                                    color="inherit"
                                                    size={24}
                                                    className={
                                                        classes.buttonProgress
                                                    }
                                                />
                                            )}
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ) : (
                            <Grid
                                item
                                xs={12}
                                md={4}
                                container
                                direction="column"
                                justify="flex-start"
                                alignItems="stretch"
                                spacing={2}
                            >
                                <Grid item>
                                    <Typography variant="h5">
                                        Become a Life Saver!
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant="h6" component="h6">
                                        Target
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        component="h4"
                                        display="inline"
                                    >
                                        {fundraiser?.target}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        component="p"
                                        display="inline"
                                    >
                                        {' '}
                                        ether
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <ContributeForm
                                        fundraiserAddress={
                                            router.query.fundraiser
                                        }
                                        minimumContribution={
                                            fundraiser?.minimumContribution
                                        }
                                        setMessage={setMessage}
                                    ></ContributeForm>
                                </Grid>
                                <Grid item>
                                    <Typography variant="caption">
                                        {`All or nothing. This fundraiser will only be
                                funded if it reaches its goal by
                                ${new Date(
                                    fundraiser ? fundraiser.deadline : 0
                                ).toLocaleString('en-IN', {
                                    timeZoneName: 'short',
                                    hour12: true,
                                })}.`}
                                    </Typography>
                                </Grid>

                                <Grid item>
                                    <Typography variant="h6" component="h6">
                                        Raised
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        component="h4"
                                        display="inline"
                                    >
                                        {fundraiser?.balance}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        component="p"
                                        display="inline"
                                    >
                                        {' '}
                                        ether
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <LinearProgressWithLabel
                                        value={
                                            fundraiser?.success
                                                ? 100
                                                : progress(
                                                      Number(
                                                          fundraiser?.balance
                                                      ),
                                                      Number(fundraiser?.target)
                                                  )
                                        }
                                    />
                                </Grid>

                                <Grid item>
                                    <Typography variant="h6" component="h6">
                                        Contributors
                                    </Typography>
                                    <Typography variant="h4" component="h4">
                                        {fundraiser?.contributorsCount}
                                    </Typography>
                                </Grid>
                            </Grid>
                        )
                    ) : fundraiser?.success ? (
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardHeader title="Fundraiser successful!" />
                                <CardContent>
                                    <Typography
                                        variant="body2"
                                        component="p"
                                        gutterBottom
                                    >
                                        Thanks to the{' '}
                                        {fundraiser.contributorsCount}{' '}
                                        contributor(s) for making this a
                                        success!
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        component="p"
                                        gutterBottom
                                    >
                                        It has achieved its target of{' '}
                                        {fundraiser.target} ether.
                                    </Typography>

                                    <Typography variant="caption" component="p">
                                        The raised money has been transferred to
                                        the{' '}
                                        <Link
                                            href={`https://rinkeby.etherscan.io/address/${fundraiser?.beneficiary}`}
                                        >
                                            beneficiary.
                                        </Link>
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ) : (
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardHeader title="Fundraiser failed!" />
                                <CardContent>
                                    <Typography
                                        variant="body2"
                                        component="p"
                                        gutterBottom
                                    >
                                        This fundraiser has failed to raise its
                                        target of {fundraiser.target} ether.
                                    </Typography>

                                    {Number(fundraiser.contributorsCount) >
                                        0 && (
                                        <Typography
                                            variant="caption"
                                            component="p"
                                        >
                                            The {fundraiser.contributorsCount}{' '}
                                            contributor(s) have been refunded.
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            </Container>
        </>
    );
}
