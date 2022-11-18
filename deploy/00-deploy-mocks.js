const { network } = require("hardhat")
const { DecimalNumber } = require("prettier-plugin-solidity/src/nodes")
const {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config")
module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre // hre - hardhat runtime environment
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts() //gets the named accounts described in hardhat.config.js file.
  console.log("Deployer address: ", deployer)
  const chainId = network.config.chainId

  if (developmentChains.includes(network.name)) {
    console.log("Local network detected. Deploying Mocks....")
    log("Local network detected. Deploying Mocks....")
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER], //defined in helper-hardhat-config.js file
    })
    log("Mocks Deployed!")
    log("__________________________________________")
  }
}

module.exports.tags = ["all", "mocks"] //tags are used to group scripts so that they can be executed in a group.
