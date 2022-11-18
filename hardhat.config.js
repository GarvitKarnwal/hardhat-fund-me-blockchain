require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-gas-reporter")
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
  },
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      chainId: 31337,
      // gasPrice: 130000000000,
    },
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 4, // chain Id of Rinkeby testnet is 4. Always.
      blockConfirmations: 6, //block confirmations to wait for after deployment and before verification.
    },
    goerli: {
      url: process.env.GOERLI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 5, // chain Id of Goerli testnet is 5. Always.
      blockConfirmations: 6, //block confirmations to wait for after deployment and before verification.
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    outputFile: "gasReport.txt", //you have to create a file in root folder with this name.
    noColors: true,
    currency: "USD",
    coinmarketcap: process.env.COINBASE_API_KEY,
    token: "ETH",
  },
  namedAccounts: {
    deployer: {
      //deployer is free text as the name of a user. You can have anything like testDeployer, ProdDeployer, etc.
      default: 0, //by default use the zeroth account in networks.<anyNetwork>.accounts array as the deployers account.
      //other syntax --
      //[chainID]: account index . For eg: 4: 5 . This states that for rinkeby network the
      //5th account in networks.<same_Network_as_ChainID>.accounts array will be used as the deployers account.
    },
  },
}
