'use client'

// Utils
import { FC } from 'react';
import { useRouter } from 'next/navigation';

// Solana
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Utils
import { notify } from "../utils/notifications";
import { checkContributorAccount } from '../utils/contributorUtils';

export const NavContributorButton: FC = () => {
  const ourWallet = useWallet();
  const { connection } = useConnection()
  const router = useRouter()

  const onClick = async () => {
    if (ourWallet.publicKey) {
      const hasContributorAccount = await checkContributorAccount(ourWallet, connection);
      if (!hasContributorAccount) {
        router.push('/contributor-registration');
      } else {
        router.push('/tasks-dashboard');
      }
    } else {
        notify({ type: 'error', message: 'Please connect your wallet to continue' });
        return;
    }
  }

  return (
    <div className="flex flex-row justify-center">
      <div className="relative group items-center">
        <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                    rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        <button
          className="px-8 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
          onClick={onClick}
        >
          <span>For Contributoor</span>
        </button>
      </div>
    </div>
  )
}