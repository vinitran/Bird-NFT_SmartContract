// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Bird is ERC721URIStorage {
    uint16 public tokenCount;
    address public adminAddr;
    constructor() ERC721("Flappy Bird", "FBIRD"){
        adminAddr = msg.sender;
    }

    modifier onlyAdmin() {
        if(msg.sender != adminAddr) {
            revert();
        }
        _;
    }

    function mint(string memory _tokenURI) external {
        tokenCount ++;
        _safeMint(msg.sender, tokenCount);
        _setTokenURI(tokenCount, _tokenURI);
    }

    function setTokenURI(uint16 _tokenID, string memory _tokenURI) external onlyAdmin {
        _setTokenURI(_tokenID, _tokenURI);
    }

}