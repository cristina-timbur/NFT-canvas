## Clone project

```git clone ...```

```cd NFT-canvas/hardhat```

```npm install```

## Compile contracts

```npx hardhat compile```

## Test contracts

```npx hardhat test```

## Deploy contracts locally

Turn on the network: ```npx hardhat node --network localhost```

Deploy the contracts individually or using the prepopulation script:
- Deploy the factory contract individually: ```npx hardhat run ./scripts/deploy_factory.js --network localhost```
- Deploy the canvas contract individually: ```npx hardhat run ./scripts/deploy_canvas.js --network localhost```
- Prepopulate the blockchain: ```npx hardhat run ./scripts/populate.js --network localhost```

## Frontend

Turn on hardhat node and prepopulate the blockchain.

Set the address of the factory contract in ```frontend/src/utils/constants.ts```.

Setup frontend: ```cd frontend && npm install```

Start frontend: ```npm start```

Enjoy!

## Cerinte proiect

### Smart contracte

Smart contractele, codul pentru deploy si testare se afla in subfolderul ```hardhat```.

Proiectul nostru implementeaza canvas-uri (tabele patratice) in care fiecare pixel este un NFT. Acestea pot fi transferate intre utilizatori prin vanzare/cumparare. De asemenea, detinatorul unui NFT poate sa ii schimbe culoarea, realizandu-se canvas-uri cu forme si figuri diverse.

Canvas-urile pot fi create printr-un smart contract ce implementeaza builder pattern. Un canvas se creeaza prin specificarea dimensiunii, a unui procentaj de royalty care se achita owner-ului initial la fiecare tranzactie de pixeli si a unui titlu. Acesta din urma poate fi schimbat chiar din contractul factory printr-un apel extern ("call").

Datorita eliminarii librariei Counters din OpenZeppelin, am implementat o librarie similara. Aceasta ajuta la indexarea pixelilor (NFT-urilor) din canvas-uri.

Testele acopera toate functionalitatile smart contractelor. De asemenea, avem un script de prepopulare care creeaza canvasuri cu diverse figuri (zambet, tabla de sah etc).

1. Utilizarea tipurilor de date specifice Solidity:
    - mapping, address: [Factory](hardhat/contracts/Factory.sol), [Canvas](hardhat/contracts/Canvas.sol)
    - structs: [Canvas](hardhat/contracts/Canvas.sol)
2. Inregistrarea de events:
    - ```ChangedColor```: [Canvas](hardhat/contracts/Canvas.sol)
    - ```CanvasCreation```, ```CanvasTitleChange```: [Factory](hardhat/contracts/Factory.sol)
3. Utilizarea de modifiers: [Factory](hardhat/contracts/Factory.sol), [Canvas](hardhat/contracts/Canvas.sol)
4. Tipuri de functii:
    - public: ambele functii din [Factory](hardhat/contracts/Factory.sol), majoritatea functiilor din [Canvas](hardhat/contracts/Canvas.sol)
    - private: ```getCanvasArea```, ```getRoyalties``` din [Canvas](hardhat/contracts/Canvas.sol)
    - external: ```changeTitle``` din [Canvas](hardhat/contracts/Canvas.sol)
    - internal: ```mintNFT``` din [Canvas](hardhat/contracts/Canvas.sol), toate functiile din [Counters](hardhat/contracts/Counters.sol)
    - pure: ```getCanvasArea``` din [Canvas](hardhat/contracts/Canvas.sol)
    - view: toate functiile getters din [Canvas](hardhat/contracts/Canvas.sol) si din [Counters](hardhat/contracts/Counters.sol)
5. Transfer de eth:
    - functia ```buy``` din [Canvas](hardhat/contracts/Canvas.sol)
6. Interactiunea dintre smart contracte:
    - contractul [Factory](hardhat/contracts/Factory.sol) creeaza contracte [Canvas](hardhat/contracts/Canvas.sol) (builder pattern)
    - prin intermediul contractului [Factory](hardhat/contracts/Factory.sol) se poate schimba titlul unui Canvas ("call")
7. Deploy pe retea locala (conform instructiunilor din readme)
8. Utilizare librarii: 
    - [Counters](hardhat/contracts/Counters.sol) - rescriere a librariei corespunzatoare care a fost eliminata din OpenZeppelin
9. Implementare de teste: [Tests](hardhat/test/test.js) are 4 grupuri de teste care verifica:
    - contractul [Factory](hardhat/contracts/Factory.sol) - crearea de noi Canvasuri, respectiv redenumirea acestora
    - contractul [Canvas](hardhat/contracts/Canvas.sol) - vanzarea & cumpararea de pixeli, colorarea pixelilor, citirea corecta a starii canvas-ului
10. Implementarea unor pattern-uri utilizate frecvent:
    - [Factory](hardhat/contracts/Factory.sol) implementeaza builder pattern ("gateway" pentru a crea Canvas-uri noi)
11. Implementarea de standarde ERC:
    - [Canvas](hardhat/contracts/Canvas.sol) implementeaza ERC721

### Aplicatie web3

Frontend-ul este o aplicatie ```ReactJs``` care foloseste libraria ```ethers.js``` pentru interactiunea cu smart contracte.

Cele doua pagini ale aplicatiei sunt:
- pagina principala, care contine lista tuturor canvas-urilor create; de asemenea, se pot crea canvas-uri noi
- pagina canvas, care randeaza tabla si permite interactiunea cu aceasta (vanzare, cumparare sau modificare a culorii pixelilor)

Pentru popularea paginii principale, aplicatia ReactJs citeste toate event-urile de tip CanvasCreation si CanvasTitleChange. De asemenea, aplicatia asculta event-urile de tip ChangedColor pentru a randa versiunea actualizata a unui canvas.

1. Utilizarea unei librarii web3: ```ethers.js```
2. Interactiunea cu smart contractele de mai sus: 
    - [factoryProvider](frontend/src/hooks/factoryProvider.tsx) interactioneaza cu [Factory](hardhat/contracts/Factory.sol)
    - [canvasProvider](frontend/src/hooks/canvasProvider.tsx) interactioneaza cu [Canvas](hardhat/contracts/Canvas.sol)
3. Tratare events:
    - evenimentele generate de [Factory](hardhat/contracts/Factory.sol) populeaza lista de canvas-uri din frontend: [factoryProvider](frontend/src/hooks/factoryProvider.tsx)
    - evenimentele generate de schimbarea culorii unui pixel coloreaza celula corespunzatoare din frontend: [canvasProvider](frontend/src/hooks/canvasProvider.tsx)
4. Analiza gaz-cost: costul gazului estimat pentru schimbarea culorii unui anumit pixel
5. Tratare exceptii: pentru metodele putForSale, revertSell si buy in [SetColorCard](frontend/src/components/SetColorCard.tsx)
