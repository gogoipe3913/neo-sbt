import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
  WagmiCore,
  WagmiCoreChains,
  WagmiCoreConnectors,
} from "https://unpkg.com/@web3modal/ethereum@2.7.1";
import { Web3Modal } from "https://unpkg.com/@web3modal/html@2.7.1";

const { mainnet, polygon, avalanche, arbitrum } = WagmiCoreChains;
const { configureChains, createConfig } = WagmiCore;
const chains = [mainnet, polygon, avalanche, arbitrum];
const projectId = "b664736f5de536f54918b3b6f5d70139"; // 2aca272d18deb10ff748260da5f78bfd
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    ...w3mConnectors({ chains, version: 2, projectId }),
    new WagmiCoreConnectors.CoinbaseWalletConnector({
      chains,
      options: {
        appName: "NeoBetting",
      },
    }),
  ],
  publicClient,
});
export const ethereumClient = new EthereumClient(wagmiConfig, chains);

export const web3Modal = new Web3Modal(
    {
      projectId,
      walletImages: {
        safe: "./images/dxsLJtxg_400x400.jpg",
      },
    },
    ethereumClient
);

export function test() {
  console.log("web3Modal :", web3Modal);
  console.log("ethereumClient :", ethereumClient);
  console.log("publicClient :", publicClient);

}

export function address() {
  const account = ethereumClient.getAccount().address;
  return account;
}

export async function createSignatureAsync(message) {
  const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = ethersProvider.getSigner();
  return await signer.signMessage(message);
}

export async function createContractAsync(address, abi) {
  const network = ethereumClient.getNetwork();
  try {
    if (parseInt(network.chain.id) !== DEFAULT_CHAINID) {
      await web3.currentProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${DEFAULT_CHAINID.toString(16)}` }],
      });
    }
  } catch (error) {
    console.log("error :", error);
    return;
  }

  const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = ethersProvider.getSigner();
  const contract = new ethers.Contract(address, abi, signer);
  // console.log("contract :", contract);

  return contract;
}

export function checkDefaultChainId() {
  const network = ethereumClient.getNetwork();
  return parseInt(network.chain.id) === DEFAULT_CHAINID
}

export async function setDefaultChainIdAsync() {
  const network = ethereumClient.getNetwork();
  try {
    if (parseInt(network.chain.id) !== DEFAULT_CHAINID) {
      await web3.currentProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${DEFAULT_CHAINID.toString(16)}` }],
      });
    }
  } catch (error) {
    console.log("error :", error);
    return;
  }
}
