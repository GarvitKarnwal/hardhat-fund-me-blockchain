const { assert } = require("chai")
const { ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
developmentChains.includes(network.name)
  ? describe.skip //these test cases will run on real testnet only
  : describe("FundMe", async function () {
      const SEND_VALUE = ethers.utils.parseEther("0.00016")
      let deployer
      let fundMe
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)
      })
      it("allows people to fund and withdraw", async function () {
        const fundTxResponse = await fundMe.fund({ value: sendValue })
        await fundTxResponse.wait(1)
        const withdrawTxResponse = await fundMe.withdraw()
        await withdrawTxResponse.wait(1)

        const endingFundMeBalance = await fundMe.provider.getBalance(
          fundMe.address
        )
        console.log(
          endingFundMeBalance.toString() +
            " should equal 0, running assert equal..."
        )
        assert.equal(endingFundMeBalance.toString(), "0")
      })

      // it("fund and withdraw", async function () {
      //     let transResp
      //     transResp = await fundMe.fund({ value: SEND_VALUE , gasLimit: 100000});
      //     // console.log("transResp: ")
      //     // console.log(transResp);
      //     await transResp.wait(1)
      //     console.log("Funding completed.")

      //     // transResp = await fundMe.cheaperWithdraw();
      //     // await transResp.wait(2)
      //     // console.log("Withdraw completed.")

      //     // let bal = await fundMe.provider.getBalance(fundMe.address);
      //     // console.log("Balance retreived.")
      //     assert.equal("0","0")//bal.toString(), "0")
      // })
    })
