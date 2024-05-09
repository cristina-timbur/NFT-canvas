## Setup

```git clone ...```

```cd NFT-canvas/hardhat```

```npm install```

## Compile contract

```npx hardhat compile```

## Test contract

```npx hardhat test```

## Deploy contract & interact locally

Turn on the network: ```npx hardhat node```

Deploy the contract: ```npx hardhat run ./scripts/deploy.js --network localhost```

Paste the contract address in scripts/interact.js

Interact with the contract: ```npx hardhat run ./scripts/interact.js --network localhost```

## Test frontend

Setup frontend: ```cd frontend && npm install && npm install @chakra-ui/react```

Start frontend: ```npm start```

Turn on hardhat node, deploy contract locally.

Select ```localhost``` and type in the address of the deployed contract.

Enjoy!