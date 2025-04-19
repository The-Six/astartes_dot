// import CryptoJS from "crypto-js";
import { keccak256, toUtf8Bytes } from "ethers";

export const hashLog = (log) => {
  // return CryptoJS.SHA256(log).toString(CryptoJS.enc.Hex);

  // const newLog = `Log entry at ${new Date().toISOString()}`;

  // Use TextEncoder to encode the log into bytes
  const encoder = new TextEncoder();
  const encodedLog = encoder.encode(log);

  // Convert the encoded bytes to a hexadecimal string
  const newHash = `0x${Array.from(encodedLog)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;

  //Hash the log to produce a 32-byte value
  const newHash32 = keccak256(toUtf8Bytes(newHash));

  return newHash32;
};