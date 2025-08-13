import { createConfig, factory } from "ponder";
import type { Abi, AbiEvent } from "viem";

import MonsterRegistryAbi from "./src/contracts/abis/MonsterRegistry.json";
import ActAbi from "./src/contracts/abis/Act.json";
import SeasonAbi from "./src/contracts/abis/Season.json";
import BattleAbi from "./src/contracts/abis/Battle.json";
import BattleFactoryAbi from "./src/contracts/abis/BattleFactory.json";
import CharacterAbi from "./src/contracts/abis/Character.json";
import StandardDeckAbi from "./src/contracts/abis/StandardDeck.json";
import PlayerStatsStorageAbi from "./src/contracts/abis/PlayerStatsStorage.json";
import deployments from "./src/contracts/deployments.json";
import CharacterFactoryAbi from "./src/contracts/abis/CharacterFactory.json";
import StandardDeckLogicAbi from "./src/contracts/abis/StandardDeckLogic.json";
import DeckConfigurationAbi from "./src/contracts/abis/DeckConfiguration.json";
import RoomRewardsAbi from "./src/contracts/abis/RoomRewards.json";
import BattleRoomAbi from "./src/contracts/abis/BattleRoom.json";

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
    Act: {
      chain: "custom",
      abi: ActAbi as Abi,
      address: factory({
        address: getDeployment("Season").address,
        event: SeasonAbi.find((val) => val.type === "event" && val.name === "ActAdded") as AbiEvent,
        parameter: "act"
      }),
      startBlock: getDeployment("Act").startBlock,
    },
    MonsterRegistry: {
      chain: "custom",
      abi: MonsterRegistryAbi as Abi,
      ...getDeployment("MonsterRegistry"),
    },
    Season: {
      chain: "custom",
      abi: SeasonAbi as Abi,
      ...getDeployment("Season"),
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
    StandardDeck: {
      chain: "custom",
      abi: StandardDeckAbi as Abi,
      ...getDeployment("StandardDeck"),
    },
    StandardDeckLogic: {
      chain: "custom",
      abi: StandardDeckLogicAbi as Abi,
      ...getDeployment("StandardDeckLogic"),
    },
    RoomRewards: {
      chain: "custom",
      abi: RoomRewardsAbi as Abi,
      ...getDeployment("RoomRewards"),
    },
    BattleRoom: {
      chain: "custom",
      abi: BattleRoomAbi as Abi,
      ...getDeployment("BattleRoom"),
    },
    DeckConfiguration: {
      chain: "custom",
      abi: DeckConfigurationAbi as Abi,
      ...getDeployment("DeckConfiguration"),
    },
  },
});
