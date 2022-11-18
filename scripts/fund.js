const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
  const { deployer } = await getNamedAccounts()
  console.log("Deployer address: ", deployer)
  // const fundMe = await ethers.getContractAt("FundMe", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512")
  //below line doesn't work. Gives contract not found error.
  //Edit: After sometime it started working itself.
  const fundMe = await ethers.getContract("FundMe", deployer)
  console.log("Funding Contract from Fund.js ...")
  const transResp = await fundMe.fund({
    value: ethers.utils.parseEther("0.00016"),
  })
  await transResp.wait(1)
  console.log("Funded!")
}
main()
  .then(() => {
    process.exit(0) //ask Node.js to terminate the current process with success code ie zero
  })
  .catch((error) => {
    console.error(error)
    process.exit(1) //ask Node.js to terminate the current process with failure code ie 1.
  })
