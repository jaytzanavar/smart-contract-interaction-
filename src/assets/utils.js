export const networks = {
  polygon: {
    chainId: `0x${Number(137).toString(16)}`,
    chainName: "Polygon Mainnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://polygon-rpc.com/"],
    blockExplorerUrls: ["https://polygonscan.com/"],
  },
  bsc: {
    chainId: `0x${Number(56).toString(16)}`,
    chainName: "Binance Smart Chain Mainnet",
    nativeCurrency: {
      name: "Binance Chain Native Token",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: [
      "https://bsc-dataseed1.binance.org",
      "https://bsc-dataseed2.binance.org",
      "https://bsc-dataseed3.binance.org",
      "https://bsc-dataseed4.binance.org",
      "https://bsc-dataseed1.defibit.io",
      "https://bsc-dataseed2.defibit.io",
      "https://bsc-dataseed3.defibit.io",
      "https://bsc-dataseed4.defibit.io",
      "https://bsc-dataseed1.ninicoin.io",
      "https://bsc-dataseed2.ninicoin.io",
      "https://bsc-dataseed3.ninicoin.io",
      "https://bsc-dataseed4.ninicoin.io",
      "wss://bsc-ws-node.nariox.org",
    ],
    blockExplorerUrls: ["https://bscscan.com"],
  },
  mumbai: {
    chainId: `0x${Number(80001).toString(16)}`,
    chainName: "Mumbai Testnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
    blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
  },
};

export const chainNetworks = {
  MainNet: 1,
  Ropsten: 3,
  Rinkeby: 4,
  Goerli: 5,
  Kovan: 42,
  SmartChain: 56,
  Polygon: 137,
  Mumbai: 80001,
};

export const chainNames = [
  { id: 1, name: "Eth Mainnet" },
  { id: 56, name: "Smart Chain" },
  { id: 137, name: "Polygon" },
  { id: 80001, name: "Polygon Testnet(Mumbai)" },
];

export const TOKENS_BY_NETWORK = {
  [chainNetworks.MainNet]: [
    {
      address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
      name: "Matic Token",
      symbol: "MATIC",
      decimals: 18,
      totalSuply: 10000000000000000000000000000,
    },
    {
      address: "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
      name: "Binance USD",
      symbol: "BUSD",
      decimals: 18,
      totalSuply: 17911718329560000000000000000,
    },
  ],
  [chainNetworks.SmartChain]: [
    {
      address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
      name: "Matic Token",
      symbol: "MATIC",
      decimals: 18,
      totalSuply: 10000000000000000000000000000,
    },
    {
      address: "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
      name: "Binance USD",
      symbol: "BUSD",
      decimals: 18,
      totalSuply: 17911718329560000000000000000,
    },
  ],
  [chainNetworks.Polygon]: [
    {
      address: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
      name: "Matic Token",
      symbol: "MATIC",
      decimals: 18,
    },
    {
      address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      name: "BUSD Token",
      symbol: "BUSD",
      decimals: 18,
      totalSuply: 4850999328629409465655005513,
    },
  ],
  [chainNetworks.Mumbai]: [
    {
      address: "0x0000000000000000000000000000000000001010",
      name: "Matic Token",
      symbol: "MATIC",
      decimals: 18,
    },
    {
      address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      name: "BUSD Token",
      symbol: "BUSD",
      decimals: 18,
      totalSuply: 4850999328629409465655005513,
    },
  ],
};

export const checkTypeOfTransaction = (args, type) => {
  if (args) {
    if (type === "Approval") {
      return "Approval of spending";
    } else {
      if (
        args[0] === "0x0000000000000000000000000000000000000000" &&
        args[1] !== "0x0000000000000000000000000000000000000000"
      ) {
        return `Mint`;
      } else if (
        args[0] !== "0x0000000000000000000000000000000000000000" &&
        args[1] === "0x0000000000000000000000000000000000000000"
      ) {
        return `Burn`;
      }
      return "Transfer";
    }
  }
};

export const checkTypeOfTransactionText = (args, type) => {
  if (args) {
    if (type === "Approval") {
      return "Approval of spending";
    } else {
      if (
        args[0] === "0x0000000000000000000000000000000000000000" &&
        args[1] !== "0x0000000000000000000000000000000000000000"
      ) {
        return `Account ${args[1]} Minted`;
      } else if (
        args[0] !== "0x0000000000000000000000000000000000000000" &&
        args[1] === "0x0000000000000000000000000000000000000000"
      ) {
        return `Account ${args[0]} Burned`;
      }
      return "Transfered";
    }
  }
};

export const checkBigNumber = (ethers, args) => {
  console.log(ethers, args);
  if (args && ethers) {
    return `${ethers.utils.formatEther(args[2].hex)}  BUSD`;
  }
};
