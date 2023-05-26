const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");

developmentChains.includes(network.name) ? describe.skip :
describe("Raffle", async function () {
    let raffle, raffleEntranceFee, deployer, interval;

    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        // fixture allows running the deploy folder with as many tags as we want
        raffle = await ethers.getContract("Raffle", deployer);
        raffleEntranceFee = await raffle.getEntranceFee();
    })

    describe("fulfillRandomWords", function () {
        it("works with live chainlink keepers and chainlink vrf and we get a random winner", async function () {
            // enter the raffle
            const startingTimestamp = await raffle.getLastTimeStamp();
            const accounts = await ethers.getSigners()
            // set up listener before entering blockchain
            await new Promise(async (resolve, reject) => {
                raffle.once("WinnerPicked", async () => {
                    console.log("WinnerPicked event fired!")
                    try {
                        // add asserts here
                        const recentWinner = await raffle.getRecentWinner()
                        const raffleState = await raffle.getRaffleState()
                        const winnerEndingBalance = await accounts[0].getBalance()
                        const endingTimeStamp = await raffle.getLastTimeStamp()

                        await expect(raffle.getPlayer(0)).to.be.reverted;
                        assert.equal(recentWinner.toString(), accounts[0].address)
                        assert.equal(raffleState, 0)
                        assert.equal(winnerEndingBalance.toString(), winnerStartingBalance.add(raffleEntranceFee).toString())
                        assert(endingTimeStamp > startingTimestamp);
                        resolve();
                    } catch (e) {
                        console.log(e)
                        reject(e)
                    }
                })

                // Enter raffle
                await raffle.enterRaffle({ value: raffleEntranceFee })
                const winnerStartingBalance = await accounts[0].getBalance()
                // this code won't complete until listener has finished listening

            })
        })
    })
})