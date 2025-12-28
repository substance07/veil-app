import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { Chain, sepolia } from "@reown/appkit/networks";;

export const projectId = "2083ce385d822455844991f544721294";

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const networks: Chain[] = [sepolia];
// eslint-disable-next-line prefer-const
let defaultChain: Chain = sepolia;

export { defaultChain };

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks,
  projectId
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
