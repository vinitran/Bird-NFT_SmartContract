const { expect } = require("chai");
const { ethers } = require("hardhat");
const fromWei = (value) => {
  return ethers.utils.formatEther(value);
}

const toWei = (value) => {
  return ethers.utils.parseUnits(value.toString(), "ether");
}

// describe("token and NFT", async function () {
//   let deployer, addr1, addr2, bird, marketplace
//   let feePercent = 1
//   let URI = "Sample URI"

//   beforeEach(async function () {
//     const BIRD = await ethers.getContractFactory("Bird");
//     const VINI = await ethers.getContractFactory("VINI");
//     [deployer, addr1, addr2] = await ethers.getSigners();
//     bird = await BIRD.deploy();
//     vini = await VINI.deploy();
//   });
//   describe("Deployment", function () {
//     it("Track name and symbol of the token", async function () {
//       expect(await vini.name()).to.equal("Vini")
//       expect(await vini.symbol()).to.equal("VINI")
//     });

//     it("Mint and check the token", async function () {
//       expect(fromWei( await vini.totalSupply())).to.equal("1000000.0")
//       expect(fromWei( await vini.balanceOf(deployer.address))).to.equal("1000000.0")
//       await vini.connect(addr1).mint(toWei(10));
//       expect(fromWei( await vini.balanceOf(addr1.address))).to.equal("10.0")
//     });

//     it("Track name and symbol of the NFT collection", async function () {
//       expect(await bird.name()).to.equal("Flappy Bird")
//       expect(await bird.symbol()).to.equal("FBIRD")
//     });

//     it("Mint NFT and check", async function () {
//       await bird.connect(addr1).mint(URI);
//       expect(await bird.tokenCount()).to.equal(1);
//       expect(await bird.balanceOf(addr1.address)).to.equal(1);
//       expect(await bird.tokenURI(1)).to.equal(URI);
//       await bird.connect(addr1).mint(URI);
//       expect(await bird.tokenCount()).to.equal(2);
//       expect(await bird.balanceOf(addr1.address)).to.equal(2);
//       expect(await bird.tokenURI(1)).to.equal(URI);
//     });
//   });
// });


describe("Marketplace", async function () {
  let deployer, addr1, addr2, addr3, bird, marketplace
  let feePercent = 1
  let URI = "Sample URI"

  beforeEach(async function () {
    const BIRD = await ethers.getContractFactory("Bird");
    const VINI = await ethers.getContractFactory("VINI");
    const Marketplace = await ethers.getContractFactory("Marketplace");
    [deployer, addr1, addr2, addr3] = await ethers.getSigners();
    bird = await BIRD.deploy();
    vini = await VINI.deploy();
    marketplace = await Marketplace.deploy(bird.address, vini.address);
  });
  describe("Deployment", function () {
    it("Check feePercent of marketplace", async function () {
      expect(await marketplace.feePercent()).to.equal(1);
      await marketplace.connect(deployer).setFeePercent(2);
      expect(await marketplace.feePercent()).to.equal(2);
    });

    it("Check mint nft and token", async function () {
      expect(fromWei(await vini.balanceOf(deployer.address))).to.equal("1000000.0");
      await bird.connect(addr1).mint(URI);
      expect(await bird.balanceOf(addr1.address)).to.equal(1);
    });

    it("Check sell and cancel sell nft", async function () {
      await bird.connect(addr1).mint(URI);
      expect(await bird.balanceOf(addr1.address)).to.equal(1);
      await vini.transfer(addr1.address, toWei(2));
      expect(fromWei(await vini.balanceOf(addr1.address))).to.equal("2.0");
      await bird.connect(addr1).setApprovalForAll(marketplace.address, true);
      
      await marketplace.connect(addr1).sellBird(1, toWei(2));
      expect(await bird.balanceOf(addr1.address)).to.equal(0);
      expect(await bird.balanceOf(marketplace.address)).to.equal(1);
      
      await marketplace.connect(addr1).cancelSellBird(1);
      expect(await bird.balanceOf(addr1.address)).to.equal(1);
      expect(await bird.balanceOf(marketplace.address)).to.equal(0);
    });

    it("Check sell snd purchase nft", async function () {
      await bird.connect(addr1).mint(URI);
      expect(await bird.balanceOf(addr1.address)).to.equal(1);
      await vini.transfer(addr1.address, toWei(2));
      expect(fromWei(await vini.balanceOf(addr1.address))).to.equal("2.0");
      await bird.connect(addr1).setApprovalForAll(marketplace.address, true);
      
      await marketplace.connect(addr1).sellBird(1, toWei(2));
      expect(await bird.balanceOf(addr1.address)).to.equal(0);
      expect(await bird.balanceOf(marketplace.address)).to.equal(1);
      
      await vini.transfer(addr2.address, toWei(20));
      await vini.connect(addr2).approve(marketplace.address, toWei(200));
      await marketplace.connect(addr2).purchaseBird(1);
      expect(await bird.balanceOf(addr2.address)).to.equal(1);
      expect(await bird.balanceOf(marketplace.address)).to.equal(0);
      expect(fromWei(await vini.balanceOf(addr1.address))).to.equal("4.0");
      // Check feePayment
      expect(fromWei(await marketplace.feePayment())).to.equal("0.02")
      await marketplace.connect(deployer).withdrawFee(toWei(0.01));
      expect(fromWei(await marketplace.feePayment())).to.equal("0.01")
    });

    it("Check offer and accept offer nft", async function () {
      await bird.connect(addr1).mint(URI);
      expect(await bird.balanceOf(addr1.address)).to.equal(1);
      await vini.transfer(addr1.address, toWei(2));
      expect(fromWei(await vini.balanceOf(addr1.address))).to.equal("2.0");
      await bird.connect(addr1).setApprovalForAll(marketplace.address, true);
      
      await marketplace.connect(addr1).sellBird(1, toWei(2));
      expect(await bird.balanceOf(addr1.address)).to.equal(0);
      expect(await bird.balanceOf(marketplace.address)).to.equal(1);
      
      await vini.transfer(addr2.address, toWei(20));
      await vini.connect(addr2).approve(marketplace.address, toWei(200));
      await marketplace.connect(addr2).offerBird(1, toWei(2));

      await vini.transfer(addr3.address, toWei(20));
      await vini.connect(addr3).approve(marketplace.address, toWei(200));
      await marketplace.connect(addr3).offerBird(1, toWei(1));

      await marketplace.connect(addr1).acceptOfferBird(1);
      expect(await bird.balanceOf(addr2.address)).to.equal(1);
      expect(await bird.balanceOf(marketplace.address)).to.equal(0);

    });

    
  });
})