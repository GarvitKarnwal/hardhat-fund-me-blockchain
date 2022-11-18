const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
  const { deployer } = await getNamedAccounts()
  let fundMe = await ethers.getContract("FundMe", deployer)
  let transResp = await fundMe.withdraw()
  await transResp.wait(1)
  console.log("Got it back!")
}
main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
