# Hardhat Raffle

## Brief Overview

###
This project implements a raffle system, generating a random address as the winner of those who entered the raffle. 

We first install the dependencies from [the repo](https://github.com/smartcontractkit/full-blockchain-solidity-course-js#hardhat-setup---smart-contract-lottery) and then we want to use the Chainlink libraries to generate random numbers for us. Thus we also install `@chainlink/contracts` and import the necessary interfaces into our contract.

We define the constructor to take in `vrfCoordinatorV2` address and entrance fee to coordinate the contract with the Chainlink coordinator and set the entrance fee. Requesting a random number is a 2-transaction process, first to request (`requestRandomWinner`) the number and then to do something with it (`fulfillRandomWords` possibly gives the raffke winner all the money in the pot). We set `fulfillRandomWords` as `internal override` as its `internal virtual` in the `VRFConsumerBaseV2.sol`, and `virtual` means it's meant to be overriden. We are inheriting `VRFConsumerBaseV2.sol` hence we indicate that `Raffle is VRFConsumerBaseV2`. Our constructor looks weird but follows the formatting [here](https://docs.chain.link/vrf/v2/subscription/examples/get-a-random-number#analyzing-the-contract).

We then use one of the methods in `VRFCoordinatorV2Interface` to request for a random number and update the constructor with the necessary parameters. The explanation and types of those parameters for requesting a random number is stated below the code block in the link above attached to constructor formatting.

We then pick a random winner with a modulo function, and we transfer the balance in the contract to the address of the winner.

We use Chainlink Keeper nodes to automate the picking of random numbers. We reference the `AutomationCompatibleInterface.sol` interface and override methods within our contract. `checkUpkeep` returns `true` if all conditions are met. Then `performUpkeep` requests the random word (int) to generate a random number to select the lottery winner.

---- Deploy scripts ----

We look at the functions we'll be deploying, starting with the constructor. We note the presence of `vrfCoordinatorV2` contract address required in the constructor so we have to mock it in the script.

As miscellaneous, we added `hardhat-shorthand` package to allow us to type `hh` instead of `yarn hardhat`.

---- Test scripts ----

Biggest focus of this chapter was tests. We wrote comprehensive test cases and made coverage as high as possible. We learnt how to make use of ethereum functions to wait for the interval to be completed, to mine a block etc. We also learnt how to catch emitted events with `Promise`. We also learnt to mock the VRFCoordinator to simulate random number generator on our local network. We tied in all the steps of the raffle into one big unit test. Other comments in the test files provide some other explanation.

We also learnt how to [get our subId](https://vrf.chain.link/sepolia/new) from Chainlink VRF & fund it, deploy the contract using the subId, register our contract with Chainlink VRF and it's subId, register the contract with Chainlink keepers and run our staging tests. We get the [recommended](https://github.com/smartcontractkit/full-blockchain-solidity-course-js#testing-on-a-testnet) LINK amounts for testing. We sign up for a [keepers account](https://automation.chain.link/sepolia) and then run our staging test. My deployed contract had an error with the staging test as I used the wrong variable.