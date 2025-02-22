// Next, React
import { FC, useEffect, useState } from 'react';
import Link from 'next/link';

// Wallet
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Components
import { RequestAirdrop } from '../../components/RequestAirdrop';
import { NavContributorButton } from '../../components/NavContributor';
import { NavProjectButton } from '../../components/NavProject';
import pkg from '../../../package.json';

// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';

export const HomeView: FC = ({ }) => {
  
  useEffect(() => {
    const setMode = () => {
      localStorage.setItem('mode', '');
    }
    setMode();
  }, []);

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <div className='mt-6'>
        <div className='text-sm font-normal align-bottom text-right text-slate-600 mt-4'>v{pkg.version}</div>
        <h1 className="flex justify-center text-center text-5xl md:pl-5 font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4">
        Contributoor
        </h1>
        </div>
        <h4 className="md:w-full text-2x1 md:text-4xl text-center text-slate-300 my-2">
          <p>Easy way to enter your skills with public projects.</p>
          {/* <p className='text-slate-500 text-2x1 leading-relaxed'>Let's contribute to the world together.</p> */}
        </h4>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-indigo-500 rounded-lg blur opacity-40 animate-tilt"></div>
          <div className="max-w-md mx-auto mockup-code bg-primary border-2 border-[#5252529f] p-6 px-3 my-2">
            <pre data-prefix=">">
              <code className="truncate">{`let's contribute to the world together`} </code>
            </pre>
          </div>
        </div>
        <div className="flex flex-col mt-2">
          <div className="flex flex-row justify-center space-x-4">
            <NavContributorButton />
            <NavProjectButton />
          </div>
        </div>
      </div>
    </div>
  );
};
