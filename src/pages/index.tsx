import Head from "next/head";
import VaultDashboard from "@/features/vault-dashboard/components/VaultDashboard";
import { VaultDashboardProvider } from "@/features/vault-dashboard/context/VaultDashboardContext";

export default function Home() {
  return (
    <>
      <Head>
        <title>Vault Risk Dashboard</title>
      </Head>
      <VaultDashboardProvider>
        <VaultDashboard />
      </VaultDashboardProvider>
    </>
  );
}
