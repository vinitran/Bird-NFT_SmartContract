pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "hardhat/console.sol";

contract Marketplace is ReentrancyGuard{
    address public owner;
    uint8 public feePercent;
    uint256 public feePayment;
    
    IERC721 bird;
    IERC20 token;

    mapping(uint16 => BirdItem) public birdItems;
    mapping (uint16 => mapping (uint16 => OfferInfor)) public amountOfferBird;
    
    event sell(
        uint16 indexed itemId,
        uint256 price,
        address indexed seller
    );

    event cancelSell(
        uint16 indexed itemId,
        address indexed seller
    );

    event purchase(
        uint16 indexed itemId,
        uint256 price,
        address indexed buyer,
        address indexed seller
    );

    event offer(
        uint16 indexed itemId,
        uint256 amount,
        address indexed offerer
    );

    event cancelOffer(
        uint16 indexed itemId,
        address indexed offerer
    );

    event acceptOffer(
        uint16 indexed itemId,
        uint256 price,
        address indexed offerer,
        address indexed seller
    );

    struct BirdItem {
        uint16 tokenId;
        uint256 price;
        address  seller;
        uint16 offer;
    }

    struct OfferInfor {
        address offerer;
        uint256 amount;
    }

    constructor(IERC721 _bird, IERC20 _token) {
        owner = msg.sender;
        bird = _bird;
        token = _token;
        feePercent = 1;
    }

    modifier onlyAdmin() {
        if(msg.sender != owner) {
            revert();
        }
        _;
    }

    function sellBird(uint16 _tokenId, uint256 _price) external nonReentrant {
        require(_price > 0, "Price must be greater than zero");
        bird.transferFrom(msg.sender, address(this), _tokenId);
        birdItems[_tokenId] = BirdItem(
            _tokenId,
            _price,
            msg.sender,
            0
        );
        emit sell(
            _tokenId,
            _price,
            msg.sender
        );
    }

    function cancelSellBird(uint16 _tokenId) external nonReentrant {
        BirdItem memory item = birdItems[_tokenId];
        require(item.seller == msg.sender, "Your account is not authorized");
        bird.transferFrom(address(this), msg.sender, _tokenId);
        delete birdItems[_tokenId];
        emit cancelSell(
            _tokenId,
            msg.sender
        );
    }

    function purchaseBird(uint16 _tokenId) external nonReentrant {
        BirdItem memory item = birdItems[_tokenId];
        require(item.seller != msg.sender, "Can not buy your own nft");
        token.transferFrom(msg.sender, address(this), item.price * feePercent / 100);
        feePayment =  item.price * feePercent / 100;
        token.transferFrom(msg.sender, item.seller, item.price);
        bird.transferFrom(address(this), msg.sender, _tokenId);
        delete birdItems[_tokenId];
        emit purchase(
            _tokenId,
            item.price,
            msg.sender,
            item.seller
        );
    }

    function offerBird(uint16 _tokenId, uint256 _amount) external nonReentrant {
        BirdItem memory item = birdItems[_tokenId];
        require(item.seller != msg.sender, "Can not offer your own nft");
        token.transferFrom(msg.sender, address(this), _amount * (100 + feePercent) / 100);
        birdItems[_tokenId].offer += 1;
        item.offer += 1;
        feePayment =  _amount * feePercent / 100;
        amountOfferBird[_tokenId][item.offer].offerer = msg.sender;
        amountOfferBird[_tokenId][item.offer].amount = _amount;
        emit offer(
            _tokenId,
            _amount,
            msg.sender
        );
    }

    function cancelOfferBird(uint16 _tokenId) external nonReentrant {
        BirdItem memory item = birdItems[_tokenId];
        require(item.seller != msg.sender, "Can not cancel offer your own nft");
        require(item.offer > 0, "Item was not offered");
        uint16 indexOfferer = 0;
        for (uint16 i = 1; i <= item.offer; i++) {
            if (amountOfferBird[_tokenId][i].offerer == msg.sender) {
                indexOfferer = i;
                break;
            }
        }
        require(indexOfferer > 0, "Your account is not offerer");
        SafeERC20.safeTransfer( token, msg.sender, amountOfferBird[_tokenId][indexOfferer].amount);
        for (uint16 i = indexOfferer; i < item.offer; i++) {
            amountOfferBird[_tokenId][i] = amountOfferBird[_tokenId][i + 1];
        }
        delete amountOfferBird[_tokenId][item.offer];
        item.offer -= 1;
        emit cancelOffer(
            _tokenId,
            msg.sender
        );
    }

    function acceptOfferBird(uint16 _tokenId) external nonReentrant {
        BirdItem memory item = birdItems[_tokenId];
        require(item.seller == msg.sender, "Your account is not authorized");
        require(item.offer > 0, "Item was not offered");
        OfferInfor memory bestOffer = amountOfferBird[_tokenId][1];
        for (uint16 i = 1; i <= item.offer; i++) {
            if (amountOfferBird[_tokenId][i].amount > bestOffer.amount) {
                bestOffer = amountOfferBird[_tokenId][i];
            }
        }
        for (uint16 i = 1; i <= item.offer; i++) {
            if (amountOfferBird[_tokenId][i].offerer != bestOffer.offerer) {
                SafeERC20.safeTransfer( token, amountOfferBird[_tokenId][i].offerer, amountOfferBird[_tokenId][i].amount);
            }
        }
        SafeERC20.safeTransfer(token, item.seller, bestOffer.amount);
        bird.transferFrom(address(this), bestOffer.offerer, _tokenId);
        emit acceptOffer(
            _tokenId,
            bestOffer.amount,
            bestOffer.offerer,
            item.seller
        );
    }

    function setFeePercent(uint8 _feePercent) external onlyAdmin {
        feePercent = _feePercent;
    }

    function withdrawFee(uint256 _amount) external onlyAdmin {
        require(_amount <= feePayment, "amount must be less than feePayment");
        SafeERC20.safeTransfer( token, msg.sender, _amount);
        feePayment -= _amount;
    }
}