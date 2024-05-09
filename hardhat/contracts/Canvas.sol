//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Canvas is ERC721, Ownable {
    using Counters for Counters.Counter;

    struct Colour {
        uint8 red;
        uint8 green;
        uint8 blue;
    }
    
    struct PixelInfo {
        uint256 price;
        bool availableForSell;
        address owner;
    }
    
    address public firstOwner;

    uint8 canvas_size;
    uint256 royaltyPercent;
    string title;

    Counters.Counter private _tokenIds;

    mapping(uint256 => PixelInfo) pixels;
    mapping(uint256 => Colour) pixelColours;

    modifier onlyTokenOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Only the owner of the NFT can apply changes to its current state.");
        _;
    }

    modifier validToken(uint256 tokenId) {
        require(tokenId <= _tokenIds.getCurrentValue(), "The NFT doesn't exist.");
        _;
    }

    modifier mintedAllTokens() {
        require(_tokenIds.getCurrentValue() < canvas_size * canvas_size, "All the possible NFTs have been already minted.");
        _;
    }

    modifier isAvailableForSell(uint256 pixel) {
        require(pixels[pixel].availableForSell, "This pixel is not available for selling.");
        _;
    }

    constructor(uint8 _size, uint256 _royaltyPercent, string memory _title) ERC721("NFTCanvas", "XXX") Ownable(tx.origin) {
        canvas_size = _size;
        firstOwner = tx.origin;
        royaltyPercent = _royaltyPercent;
        title = _title;

        for (uint8 i = 0; i < _size; i++) {
            for (uint8 j = 0; j < _size; j++) {
                mintNFT(tx.origin);
            }
        }
    }

    function changeTitle(string memory _title) external {
        require(msg.sender == firstOwner || tx.origin == firstOwner, "Only the first owner can change the title");
        title = _title;
    }

    function sell(uint256 pixel, uint256 price) onlyTokenOwner(pixel) public {
        require(ownerOf(pixel) == msg.sender, "Only the owner of the NFT can sell it.");
        pixels[pixel] = PixelInfo(price, true, msg.sender);
    }

    function revertSell(uint256 pixel) onlyTokenOwner(pixel) public {
        pixels[pixel] = PixelInfo(0, false, msg.sender);
    }

    function buy(uint256 pixel) isAvailableForSell(pixel) payable public {
        PixelInfo memory currentPixel = pixels[pixel];
        
        if (currentPixel.owner == ownerOf(pixel)) {
            safeTransferFrom(currentPixel.owner, msg.sender, pixel);
            payable(currentPixel.owner).transfer(currentPixel.price);
            
            payable(firstOwner).transfer(getRoyalties(currentPixel.price));
            
            pixels[pixel] = PixelInfo(currentPixel.price, false, msg.sender);
        } 
        else {
            pixels[pixel] = PixelInfo(currentPixel.price, false, ownerOf(pixel));
        }
    }
    
    function getRoyalties(uint256 price) private view returns (uint256) {
        uint256 newPrice = royaltyPercent * price / 100;
        return newPrice;
    }

    function changeNFTColour(uint256 tokenId, uint8 red, uint8 green, uint8 blue) validToken(tokenId) onlyTokenOwner(tokenId) public {
        pixelColours[tokenId] = Colour(red, green, blue);
    } 

    function getNFTColour(uint256 tokenId) validToken(tokenId) public view returns (uint8, uint8, uint8) {
        Colour memory result = pixelColours[tokenId];

        return (result.red, result.green, result.blue);
    }

    function mintNFT(address recipient) mintedAllTokens internal returns (uint256) {
        uint256 newItemId = _tokenIds.getCurrentValue();

        _mint(recipient, newItemId);

        _tokenIds.increment();

        return newItemId;
    }
}
