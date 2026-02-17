import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import apolloClient from "../lib/apolloClient";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "@/components/Header";
import { MarketDataProvider } from "@/context/MarketDataContext";

const client = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={client}>
      <ApolloProvider client={apolloClient}>
        <MarketDataProvider>
          <Header />
          <ToastContainer autoClose={8000} />
          <Component className="container" {...pageProps} />
        </MarketDataProvider>
      </ApolloProvider>
    </QueryClientProvider>
  );
}
