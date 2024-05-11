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

    uint256 canvas_area;
    uint256 royaltyPercent;
    string title;

    Counters.Counter private _tokenIds;

    mapping(uint256 => PixelInfo) pixels;
    mapping(uint256 => Colour) pixelColours;

    modifier onlyTokenOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Only the owner of the NFT can apply changes to its current state.");
        _;
    }

    modifier onlyFirstOwner() {
        require(msg.sender == firstOwner || tx.origin == firstOwner, "Only the first owner can change the title.");
        _;
    }

    modifier validToken(uint256 tokenId) {
        require(tokenId <= _tokenIds.getCurrentValue(), "The NFT doesn't exist.");
        _;
    }

    modifier mintedAllTokens() {
        require(_tokenIds.getCurrentValue() < canvas_area, "All the possible NFTs have been already minted.");
        _;
    }

    modifier isAvailableForSell(uint256 pixel) {
        require(pixels[pixel].availableForSell, "This pixel is not available for selling.");
        _;
    }

    modifier validRoyaltyPercent() {
        require(royaltyPercent >= 0 && royaltyPercent <= 100, "Royalty percentage must be less than or equal to 100");
        _;
    }

    constructor(uint8 _size, uint256 _royaltyPercent, string memory _title) ERC721("NFTCanvas", "XXX") Ownable(tx.origin) {
        canvas_area = getCanvasArea(_size);
        firstOwner = tx.origin;
        royaltyPercent = _royaltyPercent;
        title = _title;

        for (uint8 i = 0; i < _size; i++) {
            for (uint8 j = 0; j < _size; j++) {
                mintNFT(tx.origin);
            }
        }
    }

    function getCanvasArea(uint8 size) pure private returns (uint256) {
        return size * size;
    }

    function getTitle() public view returns (string memory) {
        return title;
    }

    function getIsAvailableForSell(uint256 index) public view returns (bool) {
        return pixels[index].availableForSell;
    }

    function getSalePrice(uint256 index) public view returns (uint256) {
        return pixels[index].price;
    }

    function changeTitle(string memory _title) onlyFirstOwner external {
        title = _title;
    }

    function sell(uint256 pixel, uint256 price) onlyTokenOwner(pixel) public {
        pixels[pixel] = PixelInfo(price, true, msg.sender);
    }

    function revertSell(uint256 pixel) onlyTokenOwner(pixel) public {
        pixels[pixel] = PixelInfo(0, false, msg.sender);
    }

    function buy(uint256 pixel) isAvailableForSell(pixel) payable public {
        PixelInfo storage currentPixel = pixels[pixel];
        
        require(currentPixel.owner == ownerOf(pixel), "Pixel not owned by current owner");
        require(msg.value >= currentPixel.price, "Insufficient payment");

        _approve(msg.sender, pixel, address(0));
        safeTransferFrom(currentPixel.owner, msg.sender, pixel);
        
        payable(currentPixel.owner).transfer(currentPixel.price);
        payable(firstOwner).transfer(getRoyalties(currentPixel.price));

        pixels[pixel] = PixelInfo(currentPixel.price, false, msg.sender);
    }
    
    function getRoyalties(uint256 price) validRoyaltyPercent private view returns (uint256) {
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
