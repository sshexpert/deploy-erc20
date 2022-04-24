import React, {FC, useEffect, useState} from 'react'
import styled from "styled-components";
import {ethers} from "ethers";

declare global {
    interface Window {
        ethereum: any
    }
}

const AuthWrap = styled.div `
  display: flex;
  flex-direction: column;
`

const Auth: FC = () => {
    const [wallet, setWallet] = useState('Unauhtorized')
    const [balance, setBalance] = useState<string>('')

    const connectToWallet = async () => {
        if (!window.ethereum) return;
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            await provider.send("eth_requestAccounts", [])
            const signer = provider.getSigner()
            const address = await signer.getAddress()
            const balance = await signer.getBalance()
                .then(res => setBalance(ethers.utils.formatEther(res)))
            setWallet(address)
            console.log(balance)
        }
        catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        connectToWallet()
    }, [])

    return (
        <AuthWrap>
            <h2>
                Wallet: {wallet}
            </h2>
            <h2>
                Balance: {balance}
            </h2>
        </AuthWrap>
    )
}
export default Auth