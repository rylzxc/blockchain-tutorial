const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name) ? describe.skip :
describe("Raffle", async function () {
    let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer, interval;
    const chainId = network.config.chainId;

    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        // fixture allows running the deploy folder with as many tags as we want
        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("Raffle", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
        raffleEntranceFee = await raffle.getEntranceFee();
        interval = await raffle.getInterval();
    });

    describe("constructor", async function () {
        it("initializes the raffle correctly", async function () {
            const raffleState = await raffle.getRaffleState();
            const interval = await raffle.getInterval();
            assert.equal(raffleState.toString(), "0")
            assert.equal(interval.toString(), networkConfig[chainId]["interval"]);
        })
    });

    describe("enterRaffle", async function () {
        it("reverts when you don't pay enough", async function () {
            await expect(raffle.enterRaffle()).to.be.revertedWith("Raffle__NotEnoughETHEntered");
        });

        it("records players when they enter", async function () {
            await raffle.enterRaffle({ value: raffleEntranceFee })
            const contractPlayer = await raffle.getPlayer(0)
            assert.equal(contractPlayer, deployer)
        });

        it("emits event on enter", async function () {
            await expect(raffle.enterRaffle({value: raffleEntranceFee})).to.emit(raffle, "RaffleEnter");
        })

        it("doesn't allow entrance when raffle is calculating", async function () {
            await raffle.enterRaffle({value: raffleEntranceFee});
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]) // to pass the time - for the checkUpkeep method's interval to return true
            await network.provider.send("evm_mine", []); 
            // Pretend to be Chainlink keeper
            await raffle.performUpkeep([]);
            await expect(raffle.enterRaffle({value: raffleEntranceFee})).to.be.revertedWith("Raffle__NotOpen");
        })
    })

    describe("checkUpkeep", async function () {
        it("returns false if people haven't send any ETH", async function () {
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]); // to pass the time - for the checkUpkeep method's interval to return true
            await network.provider.send("evm_mine", []); 
            const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]) // get the return values with callStatic
            assert(!upkeepNeeded);
        })

        it("returns false if raffle isn't open", async function () {
            await raffle.enterRaffle({value: raffleEntranceFee});
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]); // to pass the time - for the checkUpkeep method's interval to return true
            await network.provider.send("evm_mine", []); 
            await raffle.performUpkeep("0x"); // 0x is blank bytes object
            const raffleState = await raffle.getRaffleState();
            const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]) // get the return values with callStatic
            assert.equal(raffleState.toString(), "1");
            assert.equal(upkeepNeeded, false);

        })

        it("returns false if enough time hasn't passed", async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee })
            await network.provider.send("evm_increaseTime", [interval.toNumber() - 5]) // use a higher number here if this test fails
            await network.provider.request({ method: "evm_mine", params: [] })
            const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
            assert(!upkeepNeeded)
        })
        it("returns true if enough time has passed, has players, eth, and is open", async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee })
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
            await network.provider.request({ method: "evm_mine", params: [] })
            const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
            assert(upkeepNeeded)
        })
    })

    describe("performUpkeep", async function () {
        it("can only run if checkUpkeep is true", async function () {
            await raffle.enterRaffle({ value: raffleEntranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]); // to pass the time - for the checkUpkeep method's interval to return true
            await network.provider.send("evm_mine", []); 
            const tx = await raffle.performUpkeep([]);
            assert(tx);
        })

        it("reverts when checkUpkeep is false", async function () {
            await expect(raffle.performUpkeep([])).to.be.revertedWith("Raffle__UpkeepNotNeeded");
        })

        it("updates the raffle state, emits an event, and calls the vrf coordinator", async function () {
            await raffle.enterRaffle({ value: raffleEntranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]); // to pass the time - for the checkUpkeep method's interval to return true
            await network.provider.send("evm_mine", []); 
            const txResponse = await raffle.performUpkeep([]);
            const txReceipt = await txResponse.wait(1);
            const requestId = txReceipt.events[1].args.requestId; // There is a second event emitter if we refer to the interface code and it returns the requestId, retrieve from there
            const raffleState = await raffle.getRaffleState();
            assert(requestId.toNumber() > 0)
            assert(raffleState.toString() == "1")
        })
    })

    describe("fulfillRandomWords", function () {
        beforeEach(async function () {
            await raffle.enterRaffle({ value: raffleEntranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.send("evm_mine", []);
        })

        it("can only be called after performUpkeep", async function () {
            await expect(vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)).to.be.revertedWith("nonexistent request");
            await expect(vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)).to.be.revertedWith("nonexistent request");
        })

        it("picks a winner, resets the lottery, and sends money", async function () {
            const additionalEntrants = 3;
            const startingAccountIndex = 1; // deployer = 0
            const accounts = await ethers.getSigners();
            for (let i = startingAccountIndex; i < startingAccountIndex + additionalEntrants; i++) {
                const accountConnectedRaffle = raffle.connect(accounts[i])
                await accountConnectedRaffle.enterRaffle({value: raffleEntranceFee})
            }

            const startingTimestamp = await raffle.getLastTimeStamp();

            // We will wait for fulfillRandomWords to be called - set up listener, and we don't want the test to finish before listener dones listening -> use Promise
            await new Promise(async (resolve, reject) => {
                // fulfillRandomWords below emits the WinnerPicked event for this Promise to pick up
                raffle.once("WinnerPicked", async () => {
                    console.log("Found the event!")
                    try {
                        const recentWinner = await raffle.getRecentWinner();
                        console.log(recentWinner)
                        console.log(accounts[2].address)
                        console.log(accounts[1].address)
                        console.log(accounts[0].address)
                        console.log(accounts[3].address)
                        const raffleState = await raffle.getRaffleState();
                        const endingTimeStamp = await raffle.getLastTimeStamp();
                        const numPlayers = await raffle.getNumberOfPlayers();
                        const winnerEndingBalance = await accounts[1].getBalance();
                        assert.equal(numPlayers.toString(), "0");
                        assert.equal(raffleState.toString(), "0");
                        assert(endingTimeStamp > startingTimestamp);
                        
                        assert.equal(winnerEndingBalance.toString(),
                            winnerStartingBalance.add(
                                raffleEntranceFee
                                .mul(additionalEntrants)
                                .add(raffleEntranceFee)
                                .toString()
                            )
                        )

                    } catch (e) {
                        reject(e);
                    }
                    resolve()
                })
                // Set up listener
                // performUpkeep (mock being chainlink keepers)
                const tx = await raffle.performUpkeep([]);
                const txReceipt = await tx.wait(1);
                const winnerStartingBalance = await accounts[1].getBalance();
                // fulfillRandomWords (mock being chainlink VRF)
                await vrfCoordinatorV2Mock.fulfillRandomWords(txReceipt.events[1].args.requestId, raffle.address)
            })
        })
    })
})