import type { WalletState } from '@react-web3-wallet/core';
import { useMemo } from 'react';

import type { Wallet } from '../types';

export type CoreHooks = {
  useIsConnecting: () => WalletState['isConnecting'];
  useChainId: () => WalletState['chainId'];
  useAccounts: () => WalletState['accounts'];
  useAccount: () => string | undefined;
  useIsConnected: () => boolean;
};

const computeIsConnected = ({
  chainId,
  accounts,
}: Pick<WalletState, 'chainId' | 'accounts'>) => {
  return Boolean(chainId && accounts?.length);
};

const ACCOUNTS_EQUALITY_CHECKER: (
  a: WalletState['accounts'],
  b: WalletState['accounts'],
) => boolean = (oldAccounts, newAccounts) => {
  if (oldAccounts === undefined && newAccounts === undefined) return true;
  if (oldAccounts === undefined && newAccounts !== undefined) return false;
  if (oldAccounts !== undefined && newAccounts === undefined) return false;
  if (oldAccounts?.length !== newAccounts?.length) return false;

  return !!oldAccounts?.every(
    (oldAccount, i) => oldAccount === newAccounts?.[i],
  );
};

export const createCoreHooks = (wallet: Wallet): CoreHooks => {
  const { getStore } = wallet;

  const useStore = getStore();

  const useIsConnecting: CoreHooks['useIsConnecting'] = () =>
    useStore((s) => s.isConnecting);

  const useChainId: CoreHooks['useChainId'] = () => useStore((s) => s.chainId);

  const useAccounts: CoreHooks['useAccounts'] = () =>
    useStore((s) => s.accounts, ACCOUNTS_EQUALITY_CHECKER);

  const useIsConnected: CoreHooks['useIsConnected'] = () => {
    const chainId = useChainId();
    const accounts = useAccounts();

    return useMemo(
      () =>
        computeIsConnected({
          chainId,
          accounts,
        }),
      [chainId, accounts],
    );
  };

  const useAccount: CoreHooks['useAccount'] = () => useAccounts()?.[0];

  return {
    useIsConnecting,
    useChainId,
    useAccounts,
    useIsConnected,
    useAccount,
  };
};
