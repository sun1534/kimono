import BN from "bn.js";
import * as crypto from "./util/crypto";

type IpfsMultiHash = string[];

function toIpfsHash(multiHash: IpfsMultiHash) {
  return crypto.bytesToBase58(crypto.hexArrayToBytes(multiHash));
}

export interface IContractMessage {
  creator: string;
  minFragments: BN;
  totalFragments: BN;
  revealBlock: BN;
  revealPeriod: BN;
  revealSecret: BN;
  hashOfRevealSecret: BN;
  timeLockReward: BN;
  encryptedMessage: IpfsMultiHash;
  encryptedFragments: IpfsMultiHash;
}

export type MessageDataArray = [
  string,
  BN,
  BN,
  BN,
  BN,
  BN,
  BN,
  BN,
  IpfsMultiHash,
  IpfsMultiHash
];

export default class Message {
  creator: string; // Address of the creator of the message
  minFragments: number; // K-number of fragments needed to construct the secret
  totalFragments: number; // Total number of fragments that will be distributed
  revealBlock: number; // Block number for the start of the reveal period
  revealPeriod: number; // Length of the period when it's okay to reveal secret fragments
  revealSecret: Uint8Array; // Secret that'll be used to decrypt the message
  hashOfRevealSecret: Uint8Array; // Hash of the revealSecret, submitted by the user and used for verification
  timeLockReward: BN; // Time lock reward staked by the creator of the message
  encryptedMessage: string; // IPFS multi-hash of the encrypted message
  encryptedFragments: string; // IPFS multi-hash of the fragments

  constructor(message: Partial<Message>) {
    if (message.creator) this.creator = message.creator;
  }

  static fromContract(dataArray: MessageDataArray) {
    const contractMessage = {
      creator: dataArray[0],
      minFragments: dataArray[1],
      totalFragments: dataArray[2],
      revealBlock: dataArray[3],
      revealPeriod: dataArray[4],
      revealSecret: dataArray[5],
      hashOfRevealSecret: dataArray[6],
      timeLockReward: dataArray[7],
      encryptedMessage: dataArray[8],
      encryptedFragments: dataArray[9]
    };

    return new Message({
      creator: contractMessage.creator,
      minFragments: contractMessage.minFragments.toNumber(),
      totalFragments: contractMessage.totalFragments.toNumber(),
      revealBlock: contractMessage.revealBlock.toNumber(),
      revealPeriod: contractMessage.revealPeriod.toNumber(),
      revealSecret: crypto.bnToBytes(contractMessage.revealSecret, 32),
      hashOfRevealSecret: crypto.bnToBytes(
        contractMessage.hashOfRevealSecret,
        32
      ),
      timeLockReward: contractMessage.timeLockReward,
      encryptedMessage: toIpfsHash(contractMessage.encryptedMessage),
      encryptedFragments: toIpfsHash(contractMessage.encryptedFragments)
    });
  }
}