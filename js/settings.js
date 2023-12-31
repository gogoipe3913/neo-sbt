// Setting
const API_BASEURL = "https://b-entry-back.neonftproject.com/";
const ADDRESS_OENSBT = "0x92449f83abb95ad750971690B478A7eD8de31790";
const ADDRESS_ENTRY = "0x17e75e867bfB4c86D7e25C54c72eB81fb24CC65b";
// const ABI_OENSBT= abi_DaisyV1;
// const ABI_ENTRY = abi_DaisyV2;
const DEFAULT_CHAINID = Number(5); // ether:1, goerli:5, matic:137, mumbai:80001, local:1337
const BETTYPEID = {
    WIN: "1",
    QUINELLA: "22",
    TRIFECTA: "123"
};
const BETTYPEID_MAP = {
    "1": "SINGLE",
    "22": "2 TEAM",
    "123": "3 TEAM"
};


// Web3modal setting
const process = { env: { NODE_ENV: 'production' } };
// const process = { env: { NODE_ENV: 'dev' } };