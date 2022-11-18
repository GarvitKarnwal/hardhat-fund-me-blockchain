const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function () {
      //FundMe is contract name.
      let fundMe
      let deployer
      let mockV3Aggregator
      const SENT_VALUE = ethers.utils.parseEther("0.00016") //or parseUnits("1.0", "ether"), default value of 2nd arg is "wei" so no need to specify 2nd arg if you want wei.
      //runs once for each test case or suite.
      beforeEach(async function () {
        // console.log("beforeEach executed")
        deployer = (await getNamedAccounts()).deployer
        // console.log("deployer: ")
        // console.log(deployer)

        //another way to get the account on which to deploy is:
        // let accounts = await ethers.getSigners();//returns the accounts array from hardhat.config.js file networks.<anyNetwork>.accounts
        // let accountZero = accounts[0];

        //run deployment scripts.
        await deployments.fixture(["all"]) //"all" is the module.exports.tags name in deploy scripts.
        fundMe = await ethers.getContract("FundMe", deployer) // 2nd args tells about the network in which to look for FundMe contract that we recently deployed in beforeEach method.
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        )
      })

      describe("constructor", function () {
        it("sets aggregator address correctly", async function () {
          let response = await fundMe.getPriceFeed()

          assert.equal(response, mockV3Aggregator.address)
        })
      })
      describe("fund", function () {
        it("Enough ETH sent", async function () {
          // await expect(fundMe.fund()).to.be.revertedWithCustomError(fundMe, "FundMe__NotEnoughFund");

          await fundMe.checkEnoughFundSent({ value: SENT_VALUE })
          let resp = await fundMe.getEnoughFundSent()
          // console.log("Resp of checkEnoughFundSent:")
          // console.log(resp);
          assert.equal(resp, true)
        })

        it("value received in amount funded Data structure", async function () {
          console.log("ONE_ETH_VALUE")
          //   console.log(ONE_ETH_VALUE)
          console.log(SENT_VALUE.toString())
          await fundMe.fund({ value: SENT_VALUE })
          let response = await fundMe.getAddressToAmountFunded(deployer)
          assert.equal(response.toString(), SENT_VALUE.toString())
        })

        it("funder got added", async function () {
          await fundMe.fund({ value: SENT_VALUE })
          let response = await fundMe.getFunder(0)
          assert.equal(response, deployer)
        })
      })
      describe("withdraw", function () {
        beforeEach(async function () {
          await fundMe.fund({ value: SENT_VALUE })
        })

        it("Only owner should be able to withdraw", async function () {
          let accounts = await ethers.getSigners()
          let fundMeConnectedContract = await fundMe.connect(accounts[3])
          await expect(
            fundMeConnectedContract.withdraw()
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
        })

        it("Withdraw ETH from multiple funders", async function () {
          const accounts = await ethers.getSigners()
          //   console.log("account Second")
          //   console.log(accounts[1]);
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: SENT_VALUE })
          }
          await fundMe.withdraw()
          // const transResponse = await fundMe.withdraw()
          // const transReceipt = await transResponse.wait(1);

          expect(fundMe.getFunder(0)).to.be.reverted
          for (let i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            )
          }
        })

        it("Withdraw ETH from a single funder", async function () {
          const initialFundMeBalance = await fundMe.provider.getBalance(
            //same as ethers.provider.getBalance()
            fundMe.address
          )
          const initialDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          const transResponse = await fundMe.withdraw()
          const transReceipt = await transResponse.wait(1)
          const gasCost = transReceipt.effectiveGasPrice.mul(
            transReceipt.gasUsed
          )
          const finalFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const finalDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          assert.equal(
            initialFundMeBalance.add(initialDeployerBalance).toString(),
            finalDeployerBalance.add(gasCost).toString()
          )
        })
      })
    })
