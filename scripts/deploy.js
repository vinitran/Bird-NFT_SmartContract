// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const Bird = await hre.ethers.getContractFactory("Bird");
  const bird = await Bird.deploy();
  const Vini = await hre.ethers.getContractFactory("VINI");
  const vini = await Vini.deploy();
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(bird.address, vini.address);
  console.log(
    `Bird NFT address :${bird.address}`
  );
  console.log(
    `Vini address :${vini.address}`
  );
  console.log(
    `Marketplace address :${marketplace.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
