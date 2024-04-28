//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Canvas is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

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

    mapping(uint256 => PixelInfo) pixels;
    mapping(uint256 => Colour) pixelColours;

    constructor(uint8 _size, uint256 _royaltyPercent) ERC721("NFTCanvas", "XXX") {
        canvas_size = _size;
        firstOwner = msg.sender;
        royaltyPercent = _royaltyPercent;

        // TODO: Add mint all NFTs functionality.
    }

    function sell(uint256 pixel, uint256 price) public {
        require(ownerOf(pixel) == msg.sender, "Only the owner of the NFT can sell it.");
   
        pixels[pixel] = PixelInfo(price, true, msg.sender);
    }

    function revertSell(uint256 pixel) public {
        require(ownerOf(pixel) == msg.sender, "Only the owner of the NFT can revert its selling.");
   
        pixels[pixel] = PixelInfo(0, false, msg.sender);
    }

    function buy(uint256 pixel) payable public {
        PixelInfo memory currentPixel = pixels[pixel];
        require(currentPixel.availableForSell, "This pixel is not available for selling.");
        
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

    function changeNFTColour(uint256 tokenId, uint8 red, uint8 green, uint8 blue) public {
        require(tokenId <= _tokenIds.current(), "The NFT doesn't exist.");
        require(ownerOf(tokenId) == msg.sender, "Only the owner can modify the colour of a pixel.");
        
        pixelColours[tokenId] = Colour(red, green, blue);
    } 

    function getNFTColour(uint256 tokenId) public view returns (uint8, uint8, uint8) {
        require(tokenId <= _tokenIds.current(), "The specified NFT doesn't exist.");
        
        Colour memory result = pixelColours[tokenId];

        return (result.red, result.green, result.blue);
    }

    function mintNFT(address recipient) public onlyOwner returns (uint256) {
        require(_tokenIds.current() < canvas_size * canvas_size, "All the possible NFTs have been already minted.");

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);

        return newItemId;
    }
}
