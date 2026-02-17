import { ApolloClient, InMemoryCache } from "@apollo/client";

const GRAPH_URL_MAINET =
  "https://api.goldsky.com/api/public/project_cm03xfb4zf0wq01wz3w3w7nhe/subgraphs/aavev3/v0.0.1/gn";

const apolloClient = new ApolloClient({
  uri: GRAPH_URL_MAINET,
  cache: new InMemoryCache(),
});

export default apolloClient;