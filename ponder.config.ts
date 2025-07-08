import { createConfig, factory } from "ponder";
import type { Abi, AbiEvent } from "viem";

import MonsterRegistryAbi from "./src/contracts/abis/MonsterRegistry.json";
import ZigguratAbi from "./src/contracts/abis/Ziggurat.json";
import ZigguratSingletonAbi from "./src/contracts/abis/ZigguratSingleton.json";
import BattleAbi from "./src/contracts/abis/Battle.json";
import BattleFactoryAbi from "./src/contracts/abis/BattleFactory.json";
import CharacterAbi from "./src/contracts/abis/Character.json";
import BasicDeckAbi from "./src/contracts/abis/BasicDeck.json";
import PlayerStatsStorageAbi from "./src/contracts/abis/PlayerStatsStorage.json";
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

export default createConfig({
  chains: {
    custom: {
      id: 0x82384e,
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
    MonsterRegistry: {
      chain: "custom",
      abi: MonsterRegistryAbi as Abi,
      ...getDeployment("MonsterRegistry"),
    },
    ZigguratSingleton: {
      chain: "custom",
      abi: ZigguratSingletonAbi as Abi,
      ...getDeployment("ZigguratSingleton"),
    },
    BattleFactory: {
      chain: "custom",
      abi: BattleFactoryAbi as Abi,
      ...getDeployment("BattleFactory"),
    },
    Battle: {
      chain: "custom",
      abi: BattleAbi as Abi,
      address: factory({
        address: getDeployment("BattleFactory").address,
        event: BattleFactoryAbi.find((val) => val.type === "event" && val.name === "CreatedGame") as AbiEvent,
        parameter: "gameAddress"
      }),
      startBlock: getDeployment("BattleFactory").startBlock
    },
    PlayerStatsStorage: {
      chain: "custom",
      abi: PlayerStatsStorageAbi as Abi,
      address: factory({
        address: getDeployment("BattleFactory").address,
        event: BattleFactoryAbi.find((val) => val.type === "event" && val.name === "CreatedGame") as AbiEvent,
        parameter: "playerStatsStorage"
      }),
      startBlock: getDeployment("BattleFactory").startBlock
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
