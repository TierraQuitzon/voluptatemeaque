import type { Connector } from '@react-web3-wallet/core';
import { type Networkish , BrowserProvider} from 'ethers';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { Wallet } from '../types';

export type ProviderHooks = {
  useProvider: (
    network?: Networkish,
  ) => BrowserProvider | undefined;
  useHasProvider: (
    providerFilter?: Parameters<Connector['detectProvider']>[0],
    options?: Parameters<Connector['detectProvider']>[1],
  ) => boolean;
};

export const createProviderHooks = (wallet: Wallet): ProviderHooks => {
  const { useAccount, useChainId, getConnector } = wallet;

  const useProvider = (
    network?: Networkish,
  ) => {
    const account = useAccount();
    const chainId = useChainId();

    return useMemo(() => {
      // to ensure connectors remain fresh, we condition re-renders
      // when ImportedWeb3Provider account, chainId changed
      void account && chainId;
      const provider = getConnector().provider;

      if (provider) {
        return new BrowserProvider(provider, network);
      }

      return undefined;
    }, [account, chainId, network]);
  };

  const useHasProvider: ProviderHooks['useHasProvider'] = (...args) => {
    const [hasProvider, setHasProvider] = useState(false);
    const argsRef = useRef(args);
    argsRef.current = args;

    useEffect(() => {
      let canceled = false;

      getConnector()
        .detectProvider(...argsRef.current)
        .then(() => {
          if (!canceled) setHasProvider(true);
        })
        .catch(() => {
          if (!canceled) setHasProvider(false);
        });

      return () => {
        canceled = true;
      };
    }, []);

    return hasProvider;
  };

  return {
    useProvider,
    useHasProvider,
  };
};
