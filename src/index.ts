import { CHAIN_IDS, FARM_ENDPOINT, PRICE_ENDPOINT } from './constant';
import fetch from 'node-fetch';

async function checkFarms(): Promise<{ success: boolean; msg: string }> {
  const chainsNotUpdated: string[] = [];

  const query = await fetch(FARM_ENDPOINT);
  if (query.status !== 200) {
    return {
      success: false,
      msg: 'Unable to reach farm API.',
    };
  }

  const result: { [chain: number]: { updatedSecondsAgo: number } } = (await query.json()) as any;
  for (const chainId in result) {
    const farm = result[chainId];
    //6 hours
    if (farm.updatedSecondsAgo > 3600 * 6) {
      chainsNotUpdated.push(CHAIN_IDS[chainId]);
    }
  }

  if (chainsNotUpdated.length > 0) {
    return {
      success: false,
      msg: `Farm API hasn't been updated during the last 6 hours on the given chains: ${chainsNotUpdated.join(', ')}`,
    };
  }

  return {
    success: true,
    msg: '',
  };
}

async function checkPrices(): Promise<{ success: boolean; msg: string }> {
  const chainsNotUpdated: string[] = [];

  await Promise.all(
    Object.values(CHAIN_IDS).map(async (chainId) => {
      if (isNaN(chainId as number)) return;
      const query = await fetch(PRICE_ENDPOINT + chainId);
      if (query.status !== 200) {
        return {
          success: false,
          msg: 'Unable to reach price API.',
        };
      }
      const price: { updatedSecondsAgo: number } = (await query.json()) as any;
      //30 min
      if (price.updatedSecondsAgo > 1800) {
        chainsNotUpdated.push(CHAIN_IDS[chainId as number]);
      }
    })
  );

  if (chainsNotUpdated.length > 0) {
    return {
      success: false,
      msg: `Price API hasn't been updated during the last 30 minutes on the given chains: ${chainsNotUpdated.join(
        ', '
      )}`,
    };
  }

  return {
    success: true,
    msg: '',
  };
}

export { checkFarms, checkPrices };
