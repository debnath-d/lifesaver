import { enableServerWeb3, enableBrowserWeb3 } from './web3';
const factoryABI = require('./build/FundraiserFactoryABI.json');

export default function getFactoryInstance(deployedFactoryAddress) {
    if (process.browser) {
        enableBrowserWeb3();
        return new window.web3.eth.Contract(factoryABI, deployedFactoryAddress);
    } else {
        const web3 = enableServerWeb3();
        return new web3.eth.Contract(factoryABI, deployedFactoryAddress);
    }
}
