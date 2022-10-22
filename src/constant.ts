const PRICE_ENDPOINT = 'https://token-price.sushi.com/v0/';

const FARM_ENDPOINT = 'https://farm.sushi.com/v0';

enum CHAIN_IDS {
  Ethereum = 1,
  Optimism = 10,
  BSC = 56,
  Gnosis = 100,
  Fuse = 122,
  Polygon = 137,
  Fantom = 250,
  Boba = 288,
  Metis = 1088,
  Moonbeam = 1284,
  Moonriver = 1285,
  Kava = 2222,
  Arbitrum = 42161,
  Arbitrum_Nova = 42170,
  Celo = 42220,
  Avalanche = 43114,
  Harmony = 1666600000,
}

export { PRICE_ENDPOINT, FARM_ENDPOINT, CHAIN_IDS };
