import { createConfig, factory } from "ponder";
import type { Abi, AbiEvent } from "viem";

import ZigguratAbi from "./src/contracts/abis/Ziggurat.json";
import ZigguratSingletonAbi from "./src/contracts/abis/ZigguratSingleton.json";
import BattleAbi from "./src/contracts/abis/Battle.json";
import CharacterAbi from "./src/contracts/abis/Character.json";
import BasicDeckAbi from "./src/contracts/abis/BasicDeck.json";
import deployments from "./src/contracts/deployments.json";
import CharacterFactoryAbi from "./src/contracts/abis/CharacterFactory.json";

// Helper function to get deployment info by contract name
function getDeployment(contractName: string) {
  const deployment = deployments.find(d => d.contractName === contractName);
  if (!deployment) {
    throw new Error(`Deployment not found for contract: ${contractName}`);
  }
  return {
    address: deployment.contractAddress as `0x${string}`,
    startBlock: parseInt(deployment.blockNumber, 16),
  };
}

// Helper function to get all deployments for a contract name (for multiple instances)
function getAllDeployments(contractName: string) {
  const contractDeployments = deployments.filter(d => d.contractName === contractName);
  if (contractDeployments.length === 0) {
    throw new Error(`No deployments found for contract: ${contractName}`);
  }
  return contractDeployments.map(d => ({
    address: d.contractAddress as `0x${string}`,
    startBlock: parseInt(d.blockNumber, 16),
  }));
}

export default createConfig({
  chains: {
    custom: {
      id: 1,
      rpc: process.env.PONDER_RPC_URL_1!,
    },
  },
  contracts: {
    Ziggurat: {
      chain: "custom",
      abi: ZigguratAbi as Abi,
      address: factory({
        address: getDeployment("ZigguratSingleton").address,
        event: ZigguratSingletonAbi.find((val) => val.type === "event" && val.name === "ZigguratSet") as AbiEvent,
        parameter: "ziggurat"
      }),
      startBlock: getDeployment("Ziggurat").startBlock,
    },
    ZigguratSingleton: {
      chain: "custom",
      abi: ZigguratSingletonAbi as Abi,
      ...getDeployment("ZigguratSingleton"),
    },
    Battle: {
      chain: "custom",
      abi: BattleAbi as Abi,
      ...getDeployment("Battle"),
    },
    CharacterFactory: {
      chain: "custom",
      abi: CharacterFactoryAbi as Abi,
      ...getDeployment("CharacterFactory"),
    },
    Character: {
      chain: "custom",
      abi: CharacterAbi as Abi,
      address: factory({
        address: getDeployment("CharacterFactory").address,
        event: CharacterFactoryAbi.find((val) => val.type === "event" && val.name === "CharacterCreated") as AbiEvent,
        parameter: "character"
      }),
      startBlock: getDeployment("CharacterFactory").startBlock
    },
    BasicDeck: {
      chain: "custom",
      abi: BasicDeckAbi as Abi,
      ...getDeployment("BasicDeck"),
    },
  },
});
