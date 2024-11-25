'use client'

import { FC, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export const ContributorRegistrationForm: FC = () => {
  const [name, setName] = useState('')
  const { publicKey } = useWallet()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey) {
      alert('Please connect your wallet first!')
      return
    }
    // Here you would typically send this data to your Solana program
    console.log('Submitting:', { name, walletAddress: publicKey.toBase58() })
    // Reset form after submission
    setName('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="flex flex-row justify-center">
        <div className="relative group items-center">
          <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                      rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <button
            type="submit"
            className="px-8 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
          >
            Register as Contributor
          </button>
        </div>
      </div>
    </form>
  )
}

