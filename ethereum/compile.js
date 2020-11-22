const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const sourcePath = path.resolve(__dirname, 'contracts', 'Fundraiser.sol');
const source = fs.readFileSync(sourcePath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        'Fundraiser.sol': {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*'],
            },
        },
    },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

// console.log('output:');
// console.log(output);

for (let contractName in output.contracts['Fundraiser.sol']) {
    // console.log(
    //     `${contractName}: ${JSON.stringify(
    //         output.contracts['Fundraiser.sol'][contractName].evm,
    //         null,
    //         4
    //     )}`
    // );
    fs.outputJsonSync(
        path.resolve(buildPath, contractName + 'Bytecode.json'),
        output.contracts['Fundraiser.sol'][contractName].evm.bytecode.object,
        {
            spaces: 4,
        }
    );

    fs.outputJsonSync(
        path.resolve(buildPath, contractName + 'ABI.json'),
        output.contracts['Fundraiser.sol'][contractName].abi,
        {
            spaces: 4,
        }
    );
}
