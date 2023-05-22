const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

// Unit tests only run on devChains
!developmentChains.includes(network.name) ? describe.skip :
describe("FundMe", async function () {

    let fundMe;
    let deployer;
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1") // 1 ETH
    // Deploy contract first then call the functions
    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        // fixture allows running the deploy folder with as many tags as we want
        await deployments.fixture(["all"]);
        // Gets most recently deployed FundMe contract
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
    });

    describe("constructor", function () {
        it("Sets the aggregator address correctly", async function () {
            const response = await fundMe.priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        });
    });

    describe("fund", async function() {
        it("Fails if you don't send enough ETH", async function () {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            );
        })
        it("Updated the amount funded to data structure", async function () {
            await fundMe.fund({ value: sendValue });
            const response = await fundMe.addressToAmountFunded(deployer);
            assert.equal(response.toString(), sendValue.toString());
        })
        it("Add funder to array of funders", async function () {
            await fundMe.fund({ value: sendValue });
            const funder = await fundMe.funders(0);
            assert.equal(funder, deployer)
        })
    })

    describe("withdraw", async function() {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue });
        });

        it("Withdraws ETH from a single funder", async function () {
            // Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );
            // Act
            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );
            // Assert
            assert.equal(endingFundMeBalance, 0);
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            );
        });

        it("Allows us to withdraw from multiple funders", async function () {
            // Get multiple accounts first to fund the contract
            const accounts = await ethers.getSigners();
            // Start with index 1 as index 0 is deployer of the account
            for (let i = 1; i < 6; i++) {
                // Connect the different accounts to the contract
                const fundMeConnectedContract = await fundMe.connect(accounts[i]);
                await fundMeConnectedContract.fund({ value: sendValue });
            }

            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );

            // Act
            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            // Assert
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );
            // Assert
            assert.equal(endingFundMeBalance, 0);
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            );
            
            // Check if array is reset (0th element returns error)
            await expect(fundMe.funders(0)).to.be.reverted;
            
            // Check if all account mappings are back to 0
            for (i = 1; i < 6; i++) {
                assert.equal(await fundMe.addressToAmountFunded(accounts[i].address), 0);
            }
        })

        it("Only allows owner to withdraw", async function () {
            const accounts = await ethers.getSigners();
            const attacker = accounts[1];
            const attackerConnectedContract = await fundMe.connect(attacker);
            await expect(
                attackerConnectedContract.withdraw()
            ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
        })
    })  
})
