const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre // hre - hardhat runtime environment
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts() //gets the named accounts described in hardhat.config.json file.
  console.log("scripts 2 Deployer address: ", deployer)
  const chainId = network.config.chainId

  let ethUsdPriceFeedAddress
  if (developmentChains.includes(network.name)) {
    log("local chain detected")
    const ethUsdAggregator = await deployments.get("MockV3Aggregator") // this gives the recent deployed contract info using deployment name. You can also use ethers.getContract("contract name")
    ethUsdPriceFeedAddress = ethUsdAggregator.address
    // console.log("Deployed Mock Data feed contract:");
    // console.log(ethUsdAggregator);
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
  }
  // console.log("Chainlink Data Feed Address:")
  // console.log(ethUsdPriceFeedAddress)

  const fundMe = await deploy("FundMe", {
    contract: "FundMe",
    from: deployer,
    log: true,
    args: [ethUsdPriceFeedAddress],
    waitConfirmations: network.config.blockConfirmations || 1, //block confirmations to wait after deployment.
  })
  // console.log("FundMe Contract Deployed!")
  log("FundMe Contract Deployed!")
  // console.log("Deployed FundMe contract")
  // console.log(fundMe)
  log("___________________________________________")
  const _fundMe = await ethers.getContract("FundMe", deployer)
  console.log("Funding Contract from deploy script...")
  const transResp = await _fundMe.fund({
    value: ethers.utils.parseEther("0.00016"),
  })
  await transResp.wait(1)
  console.log("Funded!")
  //verify
  if (!developmentChains.includes(network.name)) {
    await verify(fundMe.address, [ethUsdPriceFeedAddress])
  }
}

module.exports.tags = ["all", "fundme"] //tags are used to group scripts so that they can be executed in a group.
