require('dotenv').config({ path: __dirname + '/../.env' });
const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const factoryABI = require('./build/FundraiserFactoryABI.json');
const factoryBytecode = require('./build/FundraiserFactoryBytecode.json');
const mnemonicPhrase = process.env.MNEMONIC_PHRASE;

const provider = new HDWalletProvider({
    mnemonic: {
        phrase: mnemonicPhrase,
    },
    providerOrUrl: process.env.INFURA_ENDPOINT,
});

const web3 = new Web3(provider);

const deploy = async () => {
    try {
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];

        console.log('Attempting to deploy from account', account);

        const result = await new web3.eth.Contract(factoryABI)
            .deploy({ data: factoryBytecode })
            .send({ gas: '5000000', from: account });

        console.log('Contract deployed to', result.options.address);
    } catch (error) {
        console.log(error);
    }
};
deploy();

provider.engine.stop();
