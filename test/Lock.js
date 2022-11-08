const { expect } = require("chai");

describe("NFTMarketplace", async function () {
  let deployer, addr1, addr2, bird, marketplace
  let feePercent = 1
  let URI = "Sample URI"
  beforeEach(async function () {
    const BIRD = await ethers.getContractFactory("Bird");
    [deployer, addr1, addr2] = await ethers.getSigners();
    bird = await BIRD.deploy();
  });
  describe("Deployment", function () {
    it("Track name and symbol of the NFT collection", async function () {
      expect(await bird.name()).to.equal("Flappy Bird")
      expect(await bird.symbol()).to.equal("FBIRD")
    });
    it("Mint NFT and check", async function () {
      await bird.connect(addr1).mint(URI);
      expect(await bird.tokenCount()).to.equal(1);
      expect(await bird.balanceOf(addr1.address)).to.equal(1);
      expect(await bird.tokenURI(1)).to.equal(URI);
      await bird.connect(addr1).mint(URI);
      expect(await bird.tokenCount()).to.equal(2);
      expect(await bird.balanceOf(addr1.address)).to.equal(2);
      expect(await bird.tokenURI(1)).to.equal(URI);

    });
  });
})