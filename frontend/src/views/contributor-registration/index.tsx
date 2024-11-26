// Next, React
import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// Wallet
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Components
import { RegisterContributor } from '../../components/RegisterContributor';

// Utils
import { checkContributorAccount } from '../../utils/contributorUtils';
import { notify } from '../../utils/notifications';
import { walletConnectedCheck } from '../../utils/utils';

export const ContributorRegistrationView: FC = () => {
  const router = useRouter();
  const wallet = useWallet();
  const { connection } = useConnection();
  const [contributorName, setContributorName] = useState('');

  useEffect(() => {
    const checkAndRedirect = async () => {
      const walletConnected = await walletConnectedCheck(wallet);
      if (walletConnected) {
        const hasContributorAccount = await checkContributorAccount(wallet, connection);
        if (hasContributorAccount) {
          notify({
            type: 'error',
            message: 'You already have a contributor registered',
            });
          router.push('/'); // Redirect to the main page if the user already registered
        }
      } else {
        router.push('/');
      }
    };

    checkAndRedirect();
  }, [wallet.publicKey, connection, router]);

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-transparent shadow-lg rounded-lg p-5 w-[450px]">
          <h2 className="text-2xl font-bold mb-4 text-center text-indigo-500">Become a Contributor</h2>
          <p className="text-base text-gray-600 mb-6 text-center">Create your contributor to start exploring tasks</p>
          <form onSubmit={(e) => { e.preventDefault(); }}>
            <div className="mb-6">
              <label className="block text-lg font-light text-gray-600">Name</label>
              <input
                type="text"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                className="mt-2 block w-full px-5 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg text-indigo-800"
                required
              />
            </div>
            <RegisterContributor name={contributorName} />
          </form>
        </div>
      </div>
    )
}