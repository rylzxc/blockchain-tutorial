const { ethers } = require("hardhat");
const { getWeth, AMOUNT } = require("../scripts/getWeth")

async function main() {
    await getWeth()
    const { deployer } = await getNamedAccounts();
    // abi, address
    // In Aave protocol, there is a contract (LendingPoolAddressProvider Contract) that points us to the correct contract (LendingPool Contract)
    const lendingPool = await getLendingPool(deployer)

    // deposit - before we deposit we have to prove our contract
    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    // approve
    await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)
    console.log("Depositing...")
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log("Deposited!")

    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer)

    const daiPrice = await getDaiPrice()

    const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber()) // we borrow 95% to not hit the limit, 95 cna be changed
    console.log(`You can borrow ${amountDaiToBorrow.toString()} DAI`)
    const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString())
    // Borrow
    // How much we have borrowed, how much we have collateral - all can get from aave docs
    const daiTokenAddress = "0x6b175474e89094c44da98b954eedeac495271d0f"
    await borrowDai(
        daiTokenAddress,
        lendingPool,
        amountDaiToBorrowWei,
        deployer
    )
    await getBorrowUserData(lendingPool, deployer)

    await repay(amountDaiToBorrowWei, daiTokenAddress, lendingPool, deployer)
    await getBorrowUserData(lendingPool, deployer) 
    // when we run the script we realise we still have some ETH borrowed remaining. This is because we accumulate interest as we borrow
    // we can thus use uniswap to swap ethereum for dai to repay everything
}

async function repay(amount, daiAddress, lendingPool, account) {
    await approveErc20(daiAddress, lendingPool.address, amount, account)
    const repayTx = await lendingPool.repay(daiAddress, amount, 1, account)
    await repayTx.wait(1)
    console.log("Repaid!")
}

async function borrowDai(daiAddress, lendingPool, amountDaiToBorrowWei, account) {
    const borrowTx = await lendingPool.borrow(daiAddress, amountDaiToBorrowWei, 1, 0, account)
    await borrowTx.wait(1)
    console.log("You've borrowed!")
}

async function getDaiPrice() {
    const daiPriceFeed = await ethers.getContractAt("AggregatorV3Interface", "0x773616E4d11A78F511299002da57A0a94577F1f4")
    const price = (await daiPriceFeed.latestRoundData())[1] // we only want the first index
    console.log(`The DAI/ETH price is ${price.toString()}`)
    return price
}

async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } = await lendingPool.getUserAccountData(account)
    console.log(`You have ${totalCollateralETH} worth of ETH deposited.`)
    console.log(`You have ${totalDebtETH} worth of ETH borrowed.`)
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH.`)
    return { availableBorrowsETH, totalDebtETH }
}

async function approveErc20(erc20Address, spenderAddress, amountToSpend, account) {
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account)
    const tx = await erc20Token.approve(spenderAddress, amountToSpend)
    await tx.wait(1)
    console.log("Approved!")
}

async function getLendingPool(account) {
    const lendingPoolAddressesProvider = await ethers.getContractAt("ILendingPoolAddressesProvider", "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5", account)
    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account)
    return lendingPool
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })