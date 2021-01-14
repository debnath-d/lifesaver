import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import InputAdornment from '@material-ui/core/InputAdornment';
import {
    BaseDatePickerProps,
    LocalizationProvider,
    DateTimePicker,
} from '@material-ui/pickers';
import DateFnsAdapter from '@material-ui/pickers/adapter/date-fns';
import { string, date, object, number } from 'yup';
import { Formik, Form, Field, FieldProps, useField } from 'formik';
import enIN from 'date-fns/locale/en-IN';
import getFactoryInstance from '../../ethereum/factory';
import { enableBrowserWeb3 } from '../../ethereum/web3';
import { useRouter } from 'next/router';
import { factoryAddress } from '../index';
import web3 from 'web3';
import Head from 'next/head';
import { trigger } from 'swr';

declare global {
    interface Window {
        ethereum: any;
        web3: any;
    }
}

export const ETHINR = 46500;
const maximumDate = new Date(Date.now() + 60 * 24 * 3600000);

interface DatePickerFieldProps extends FieldProps, BaseDatePickerProps {
    getShouldDisableDateError: (date: Date) => string;
}

function DatePickerField(props: DatePickerFieldProps) {
    const {
        field,
        form,
        getShouldDisableDateError,
        maxDate = maximumDate,
        minDate = new Date(),
        onError,
        ...other
    } = props;
    const currentError = form.errors[field.name];

    return (
        <LocalizationProvider dateAdapter={DateFnsAdapter} locale={enIN}>
            <DateTimePicker
                disablePast
                minDate={minDate}
                maxDate={maxDate}
                value={field.value}
                // Make sure that your 3d param is set to `true` in order to run validation
                onChange={(newValue) =>
                    form.setFieldValue(field.name, newValue, true)
                }
                renderInput={(inputProps) => (
                    <TextField
                        name={field.name}
                        {...inputProps}
                        {...other}
                        error={Boolean(currentError)}
                        helperText={currentError ?? inputProps.helperText}
                        // Make sure that your 3d param is set to `true` in order to run validation
                        onBlur={() =>
                            form.setFieldTouched(field.name, true, true)
                        }
                    />
                )}
            />
        </LocalizationProvider>
    );
}

export const MyTextField = (props: any) => {
    const [field, meta] = useField(props);
    // console.log('props', props);
    // console.log('field', field);
    const errorText = meta.error && meta.touched ? meta.error : '';
    return (
        <TextField
            {...field}
            {...props}
            helperText={errorText}
            error={!!errorText}
        />
    );
};

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

export default function New({ message: { setMessage } }: any) {
    const classes = useStyles();
    const router = useRouter();

    return (
        <>
            <Head>
                <title>New Fundraiser</title>
            </Head>
            <Container maxWidth="xs">
                <Typography variant="h4" gutterBottom>
                    New Fundraiser
                </Typography>
                <Formik
                    validationSchema={object({
                        name: string()
                            .required('Your fundraiser must have a name')
                            .min(10, 'Must have at least 10 characters')
                            .max(150, 'Name should not exceed 150 characters'),
                        minimumContribution: number()
                            .typeError('Minimum contribution must be a number')
                            .required(
                                'You must specify a minimum contribution amount'
                            )
                            .moreThan(
                                0,
                                'Minimum contribution should be greater than zero'
                            ),
                        target: number()
                            .typeError('Target must be a number')
                            .required(
                                'Your fundraiser must have a target amount'
                            )
                            .moreThan(
                                0,
                                'Your fundraiser should try to raise a positive amount'
                            ),
                        deadline: date()
                            .typeError('You must enter a valid date and time')
                            .required('Deadline is required')
                            .min(
                                new Date(),
                                'Deadline cannot be earlier than right now!'
                            )
                            .max(
                                maximumDate,
                                `Deadline must not exceed ${maximumDate.toLocaleDateString(
                                    'en-IN',
                                    {
                                        timeZoneName: 'short',
                                    }
                                )}`
                            ),
                    })}
                    initialValues={{
                        minimumContribution: '',
                        name: '',
                        target: '',
                        deadline: new Date(Date.now() + 24 * 3600000),
                    }}
                    onSubmit={async ({
                        minimumContribution,
                        name,
                        target,
                        deadline,
                    }) => {
                        try {
                            const factory = getFactoryInstance(factoryAddress);

                            await enableBrowserWeb3(true);

                            const accounts = await window.ethereum.request({
                                method: 'eth_accounts',
                            });

                            // console.log({ accounts });

                            const response = await factory.methods
                                .createFundraiser(
                                    web3.utils.toWei(
                                        minimumContribution,
                                        'ether'
                                    ),
                                    name,
                                    web3.utils.toWei(target, 'ether'),
                                    String(
                                        Math.floor(
                                            deadline.setSeconds(0) / 1000
                                        )
                                    )
                                )
                                .send({
                                    from: accounts[0],
                                });

                            trigger(factoryAddress);

                            setMessage({
                                openMessage: true,
                                severity: 'success',
                                message:
                                    'Your fundraiser has been created sucessfully!',
                            });

                            router.push('/');
                        } catch (error) {
                            setMessage({
                                openMessage: true,
                                severity: 'error',
                                message: error.message,
                            });
                        }
                    }}
                >
                    {({ values, errors, isSubmitting }) => (
                        <Form noValidate>
                            <MyTextField
                                placeholder="Describe your medical emergency"
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                // type="number"
                                id="name"
                                label="Fundraiser Name"
                                name="name"
                                autoFocus
                                autoComplete="name"
                            />

                            <MyTextField
                                placeholder={`1 ether = ₹ ${ETHINR.toLocaleString()} (approx)`}
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                // type="number"
                                id="minimumContribution"
                                label="Minimum Contribution"
                                name="minimumContribution"
                                autoComplete="transaction-amount"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="start">
                                            ether
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <MyTextField
                                placeholder={`1 ether = ₹ ${ETHINR.toLocaleString()} (approx)`}
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                // type="number"
                                id="target"
                                label="Target"
                                name="target"
                                autoComplete="transaction-amount"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="start">
                                            ether
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Field
                                name="deadline"
                                label="Deadline"
                                margin="normal"
                                variant="outlined"
                                autoComplete="bday"
                                id="deadline"
                                required
                                fullWidth
                                component={DatePickerField}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={isSubmitting}
                            >
                                Create
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
            </Container>
        </>
    );
}
