import { RPC_URL } from "@/shared/constant";
import { ethers } from "ethers";

export const getMaxGasPrice = async (): Promise<string> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    const feeData = await provider.getFeeData();

    const maxFeePerGas = feeData.maxFeePerGas;

    return maxFeePerGas
      ? Number(ethers.utils.formatUnits(maxFeePerGas, "gwei")).toFixed(2)
      : "0.00";
  } catch (error) {
    console.error("Error fetching max gas price:", error);
    throw new Error("Failed to fetch max gas price");
  }
};
