'use client'

import { useRouter } from 'next/navigation'

import { verify } from '@noble/ed25519';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { FC, useCallback, useState, useEffect } from 'react';
import { notify } from "../utils/notifications";

import { Program, AnchorProvider, web3, utils, BN, setProvider } from "@coral-xyz/anchor"
import idl from "./mvp_contributoor.json"
import { MvpContributoor as MvpContributoorType } from "./mvp_contributoor"
import { PublicKey } from '@solana/web3.js';

import { checkContributorAccount } from '../utils/contributorUtils';

const idl_string = JSON.stringify(idl)
const idl_object = JSON.parse(idl_string)
const programID = new PublicKey(idl.address)

export const NavContributorButton: FC = () => {
  const ourWallet = useWallet();
  const { connection } = useConnection()
  const router = useRouter()

  const getProvider = () => {
      const provider = new AnchorProvider(connection, ourWallet, AnchorProvider.defaultOptions())
      setProvider(provider)
      return provider
  }

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