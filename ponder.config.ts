import { createConfig } from "ponder";

import { ZigguratContractAbi } from "./src/abis/ZigguratAbi";
import { BattleContractAbi } from "./src/abis/BattleAbi";
import { CharacterContractAbi } from "./src/abis/CharacterAbi";
import { BasicDeckContractAbi } from "./src/abis/BasicDeckAbi";

export default createConfig({
  chains: {
    mainnet: {
      id: 1,
      rpc: process.env.PONDER_RPC_URL_1!,
    },
  },
  contracts: {
    Ziggurat: {
      chain: "mainnet",
      abi: ZigguratContractAbi,
      address: "0xbff6f4934ebe3f4388051bc995331dbfcadcaabf",
      startBlock: 0x141280,
    },
    Battle: {
      chain: "mainnet",
      abi: BattleContractAbi,
      address: "0x0ec717cca68f5f96118e9e926be8414a385a1c6c",
      startBlock: 0x14127e,
    },
    Character: {
      chain: "mainnet",
      abi: CharacterContractAbi,
      address: [
        "0x18e5b1dc87a706a9d8fc1e12cfeb6e2992b1c7b7",
        "0x59c2479ea12e9baa41994cb0faa5f2ab20eefbab",
        "0x3fc7f6214b83468c09f423da1851c430e82f1fdc",
        "0x3be60dce791090a8b8a1ea77ac10371ff97a1c7b",
      ],
      startBlock: 0x141282,
    },
    BasicDeck: {
      chain: "mainnet",
      abi: BasicDeckContractAbi,
      address: "0x28454068c860e20086cc429147dae5c01456921a",
      startBlock: 0x14127f,
    },
  },
});
