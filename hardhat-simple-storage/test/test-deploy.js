const {ethers} = require("hardhat");
const {expect, assert} = require("chai");

describe("SimpleStorage", function () {

  // Declare here such that it()s can reference them
  let simpleStorageFactory, simpleStorage

  // beforeEach() tells us what to do before each it(), therefore like an init function
  beforeEach(async function () {
    simpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await simpleStorageFactory.deploy();
  })

  // it()s are where we write the code to be tested
  it("Should start with a favourite number of 0", async function () {
    const currentValue = await simpleStorage.retrieve();
    const expectedValue = "0";
    assert.equal(currentValue.toString(), expectedValue);
  })

  it("Should update when we call store", async function () {
    const expectedValue = "7";
    const transactionResponse = await simpleStorage.store(expectedValue);
    await transactionResponse.wait(1);

    const currentValue = await simpleStorage.retrieve();
    assert.equal(currentValue.toString(), expectedValue);
  })
})