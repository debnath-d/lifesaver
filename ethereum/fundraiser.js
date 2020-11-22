import { enableServerWeb3, enableBrowserWeb3 } from './web3';
const fundraiserABI = require('./build/FundraiserABI.json');

export default function getFundraiserInstance(fundraiserAddress) {
    if (process.browser) {
        enableBrowserWeb3();
        return new window.web3.eth.Contract(fundraiserABI, fundraiserAddress);
    } else {
        const web3 = enableServerWeb3();
        return new web3.eth.Contract(fundraiserABI, fundraiserAddress);
    }
}
