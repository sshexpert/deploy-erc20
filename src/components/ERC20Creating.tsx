import React, {FC, useState} from 'react'
import styled from "styled-components";
import ERCToken from '../artifacts/src/contracts/CreateERC20.sol/ERC20Token.json'

//API
import {applyDecimals} from "../utils/ethereumAPI";
import {ethers} from "ethers";
import {BigNumber} from "ethers";

const Wrapper = styled.div `
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
`
const InputWrap = styled.div `
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const CreateToken = styled.button `
  background-color: blueviolet;
  color: #fff;
  border: none;
  font-weight: 500;
  padding: 5px 40px;
  border-radius: 10px;
  cursor: pointer;
`
const TokenWrap = styled.div `
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const abi = ERCToken.abi

const contractAddress = '0xcf27F781841484d5CF7e155b44954D7224caF1dD'

interface ITokenInfo {
    name: string,
    symbol: string,
    totalSupply: string
}


const ERC20Creating: FC = () => {

    const defaultDecimals = "18";
    const defaultInitialSupply = "1000000000000000000";

    const [balance, setBalance] = useState<string>()
    const [amount, setAmount] = useState("1000000000000000000")

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let erc20: ethers.Contract;
    let signer: any
    const createToken = async () => {
        if (!window.ethereum) return
        try {
            const oneEther = BigNumber.from(amount);
            signer = await provider.getSigner()
            const CreateERC20 = new ethers.ContractFactory(abi, ERCToken.bytecode, signer)
            const address = await signer.getAddress()
            const ERC20 = await CreateERC20.deploy()
            const tx = await ERC20.mint(address, {value: oneEther});
            const txResult = await tx.wait();
            const balance = await ERC20.balances(address)
            erc20 = ERC20;
            setBalance(ethers.utils.formatEther(balance))
            console.log("balance1:", balance);
        }
        catch (e) {
            console.log(e)
        }
    }

    const burnToken = async () => {
        try {
            signer = await provider.getSigner()
            console.log(signer)
            const address = await signer.getAddress()
            const ERC20 = new ethers.ContractFactory(abi, ERCToken.bytecode, signer)
            const burnToken = await ERC20.deploy()
            const tx = await burnToken.burn(address);
            const txResult = await tx.wait();
            const balance = await burnToken.balances(address)
            setBalance(ethers.utils.formatEther(balance))
            console.log("balance1:", balance);
        }
        catch (e) {
            console.log(e)
        }
    }
    const getContractBalance = async () => {
        try {
            console.log(erc20);
            const balance = await erc20.balances(await signer.getAddress());
            console.log("balance2:", balance);
        }
        catch (e) {
            console.log(e)
        }
    }

    return (
        <div>
            <h1>Minted token balance: {balance}</h1>
            <Wrapper>
                <CreateToken onClick={() => createToken()}>Create</CreateToken>
                <input placeholder={defaultInitialSupply} value={amount} onChange={e => setAmount(e.target.value)}/>
                <CreateToken onClick={() => burnToken()}>Burn</CreateToken>
            </Wrapper>
        </div>
    )
}

export default ERC20Creating