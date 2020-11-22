import TextField from '@material-ui/core/TextField';
import { Formik, Form } from 'formik';
import { object, number } from 'yup';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import InputAdornment from '@material-ui/core/InputAdornment';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { enableBrowserWeb3 } from '../ethereum/web3';
import getFundraiserInstance from '../ethereum/fundraiser';
import web3 from 'web3';
import { ETHINR, MyTextField } from '../pages/fundraiser/new';
import { trigger } from 'swr';

declare global {
    interface Window {
        ethereum: any;
        web3: any;
    }
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        buttonProgress: {
            color: theme.palette.primary.main,
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: -12,
            marginLeft: -12,
        },
    })
);

export default function ContributeForm({
    fundraiserAddress,
    minimumContribution,
    setMessage,
}: any) {
    const classes = useStyles();
    // console.log(setMessage);

    return (
        <Formik
            initialValues={{
                amount: '',
            }}
            validationSchema={object({
                amount: number()
                    .typeError('Amount must be a number')
                    .required('You must specify an amount')
                    .min(
                        minimumContribution,
                        `Amount should be more than minimum contribution (${minimumContribution} ether)`
                    ),
            })}
            onSubmit={async (data) => {
                // console.log(Number(data.amount));
                try {
                    const fundraiser = getFundraiserInstance(fundraiserAddress);
                    await enableBrowserWeb3(true);

                    const accounts = await window.ethereum.request({
                        method: 'eth_accounts',
                    });

                    const response = await fundraiser.methods
                        .contribute()
                        .send({
                            from: accounts[0],
                            value: web3.utils.toWei(data.amount, 'ether'),
                        });

                    console.log(response);

                    trigger(fundraiserAddress);
                    setMessage({
                        openMessage: true,
                        severity: 'success',
                        message: 'Thank you for your generous contribution!',
                    });
                } catch (error) {
                    setMessage({
                        openMessage: true,
                        severity: 'error',
                        message: error.message,
                    });
                }
            }}
        >
            {({ values, isSubmitting }) => (
                <Form noValidate>
                    <MyTextField
                        placeholder={`1 ether = ₹ ${ETHINR.toLocaleString()} (approx)`}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="amount"
                        label="Amount"
                        name="amount"
                        autoComplete="transaction-amount"
                        // autoFocus
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="start">
                                    ether
                                </InputAdornment>
                            ),
                        }}
                        as={TextField}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                    >
                        Contribute
                        {isSubmitting && (
                            <CircularProgress
                                color="inherit"
                                size={24}
                                className={classes.buttonProgress}
                            />
                        )}
                    </Button>
                </Form>
            )}
        </Formik>
    );
}
