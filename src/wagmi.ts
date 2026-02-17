import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { mainnet } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "aave",
  projectId: "5e1c3681d06b9ad8525c4aae31162776",
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(
      "https://eth-mainnet.g.alchemy.com/v2/Rr1orFKH4xrM32kZ0FKDj327hWQbmhPK"
    ),
  },

  ssr: true,
});
