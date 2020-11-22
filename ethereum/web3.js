require('dotenv').config({ path: __dirname + '/../.env' });
import Web3 from 'web3';

const INFURA_ENDPOINT =
    'https://rinkeby.infura.io/v3/c7a58123406b430fba729e05400e8560';

export async function enableBrowserWeb3(requestAccountAccess = false) {
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        if (requestAccountAccess) {
            try {
                // Request account access if needed
                await ethereum.request({ method: 'eth_requestAccounts' });
            } catch (error) {
                // User denied account access…
                console.log(error);
            }
        }
    }
    // else if (window.web3) {
    //     // Legacy dapp browsers…
    //     window.web3 = new Web3(web3.currentProvider);
    //     console.log('legacy dapp');
    // }
    else {
        // Non-dapp browsers…
        window.web3 = new Web3(INFURA_ENDPOINT);
        if (requestAccountAccess) {
            throw new Error(
                'No ethereum wallet detected. Please install the MetaMask extension!'
            );
        }
        console.log(
            'No ethereum wallet detected. Please install the MetaMask extension!'
        );
    }
}

export function enableServerWeb3() {
    const web3 = new Web3(INFURA_ENDPOINT);
    return web3;
}
