// Next, React
import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// Wallet
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Components
import { RegisterProject } from '../../components/RegisterProject';

// Utils
import { checkProjectAccount } from '../../utils/projectUtils';
import { notify } from '../../utils/notifications';
import { walletConnectedCheck } from '../../utils/utils';
export const ProjectRegisterView: FC = () => {
  const router = useRouter();
  const wallet = useWallet();
  const { connection } = useConnection();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  useEffect(() => {
    const checkAndRedirect = async () => {
      const walletConnected = await walletConnectedCheck(wallet);
      if (walletConnected) {
        const hasProjectAccount = await checkProjectAccount(wallet, connection);
        if (hasProjectAccount) {
          notify({
            type: 'error',
            message: 'You already have a project registered',
          });
          router.push('/'); // Redirect to the main page if the user already registered
          return;
        }
      } else {
        router.push('/');
        return;
      }
    };

    checkAndRedirect();
  }, [wallet.publicKey, connection, router]);

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-transparent shadow-lg rounded-lg p-5 w-[450px]">
          <h2 className="text-2xl font-bold mb-4 text-center text-indigo-500">Register Your Project</h2>
          <p className="text-base text-gray-600 mb-6 text-center">Create your project to start receiving contributions</p>
          <form onSubmit={(e) => { e.preventDefault(); }}>
            <div className="mb-6">
              <label className="block text-lg font-light text-gray-600">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="mt-2 block w-full px-5 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg text-indigo-800"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-lg font-light text-gray-600">Project Description</label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="mt-2 block w-full px-5 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg text-indigo-800"
                required
              />
            </div>
            <RegisterProject name={projectName} description={projectDescription} />
          </form>
        </div>
      </div>
    )
}