import React, {FC, useEffect, useState} from 'react'
import styled from "styled-components";
import ERCToken from '../artifacts/src/contracts/CreateERC20.sol/ERC20Token.json'

//API
import {applyDecimals} from "../utils/ethereumAPI";
import {ethers} from "ethers";
import {BigNumber} from "ethers";
import {address} from "hardhat/internal/core/config/config-validation";
import {getSigner} from "@nomiclabs/hardhat-ethers/internal/helpers";

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
  margin-bottom: 10px;
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
    //Mint
    const [balance, setBalance] = useState<string>()
    const [mintedTokenBalance, setMintedTokenBalance] = useState<string>();
    const [amount, setAmount] = useState("1")
    //Transfer
    const [transferAmount, setTransferAmount] = useState('1')
    const [transferAddress, setTransferAddress] = useState<string>('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
    //TransferFrom
    const [transferFromAddress, setTransferFromAddress] = useState<string>()
    const [transferFromAmount, setTransferFromAmount] = useState<string>()
    const [transferToAddress, setTransferToAddress] = useState<string>()
    

    //Approve
    const [approveAddress, setApproveAddress] = useState<string>()
    const [erc20, setErc20] = useState<ethers.Contract>();
    const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>();
    const [address, setAddress] = useState<string>()

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const createToken = async () => {
        if (!window.ethereum) return
        try {
            const ether = BigNumber.from(applyDecimals(amount));
            setSigner(await provider.getSigner());
            const CreateERC20 = new ethers.ContractFactory(abi, ERCToken.bytecode, signer)
            const address = await signer!.getAddress()
            const ERC20 = await CreateERC20.deploy()
            const tx = await ERC20.mint({value: ether});
            const txResult = await tx.wait();
            const balance = await ERC20.balances(address)
            setErc20(ERC20);
            setBalance(ethers.utils.formatEther(balance))
            console.log(signer)
            console.log("createToken balance:", balance);
        }
        catch (e) {
            console.log(e)
        }
    }

    const burnToken = async () => {
        try {
            const address = await signer!.getAddress();
            const tx = await erc20!.burn(address);
            await tx.wait();
            const balanceToken = await erc20!.balances(address)
            const balanceETH = await provider.getBalance(address);
            setBalance(ethers.utils.formatEther(balanceToken));
            console.log("burn balanceToken: {0}, balanceETH: {1}", balanceToken, balanceETH);
        }
        catch (e) {
            console.log(e)
        }
    }
    const getContractBalance = async () => {
        try {
            console.log(erc20);
            const balance = await erc20!.balances(await signer!.getAddress());
            console.log("balance2:", balance);
        }
        catch (e) {
            console.log(e)
        }
    }
    const transfer = async () => {
        try {
            const ether = BigNumber.from(applyDecimals(transferAmount));
            setSigner(await provider.getSigner())
            const address = await signer!.getAddress()
            const tx = await erc20!.transfer(transferAddress, ether)
            const txResult = await tx.wait()
            //Update balance
            const balance = await erc20!.balances(address)
            console.log(balance)
            setBalance(ethers.utils.formatEther(balance))
        }
        catch (e) {
            console.log(e)
        }
    }

    const transferFrom = async () => {
        try {
            const ether = BigNumber.from(applyDecimals(transferFromAmount));
            const address = await signer!.getAddress();
            console.log(ether, `transferFrom address: ${transferFromAddress}`,  `transferTo address ${transferToAddress}`)
            const tx = await erc20!.transferFrom(transferFromAddress, transferToAddress, ether);
            const txResult = await tx.wait();
            const balance = await erc20!.balances(address)
            setBalance(ethers.utils.formatEther(balance))
            console.log("After transferFrom: ", balance);
        }
        catch (e) {
            console.log(e)
            alert('You dont have permission to use it')
        }
    }

    const approve = async () => {
        try {
            console.log('Approve address: ', approveAddress)
            const tx = await erc20!.approve(approveAddress);
            const txResult = await tx.wait()
            console.log(txResult)
        }
        catch (e) {
            console.log(e)
        }
    }

    const getData = async () => {
        let signer = await provider.getSigner()
        setSigner(signer)
    }

    useEffect(() => {
        if (!signer || !address) {
            getData()
        }
    })

    return (
        <div>
            {balance ? (<h1>Minted token balance: {balance}</h1>) : (<h1>Create your own Token!</h1>)}
            <Wrapper>
                <CreateToken onClick={() => createToken()}>Create</CreateToken>
                <input placeholder="1" value={amount} onChange={e => setAmount(e.target.value)}/>
                <CreateToken onClick={() => burnToken()}>Burn All</CreateToken>
            </Wrapper>
            <h1>Transfer</h1>
            <Wrapper>
                <label>Amount in Eth</label>
                <input placeholder="1" value={transferAmount} onChange={e => setTransferAmount(e.target.value)}/>
                <label>To</label>
                <input placeholder="address" value={transferAddress} onChange={e => setTransferAddress(e.target.value)}/>
                <CreateToken onClick={() => transfer()}>Transfer</CreateToken>
            </Wrapper>
            <h1>Approve Address</h1>
                <Wrapper>
                    <input placeholder='White list address' value={approveAddress} onChange={e => setApproveAddress(e.target.value)}/>
                    <CreateToken onClick={() => approve()}>Approve</CreateToken>
                </Wrapper>
            <h1>TransferFrom</h1>
            <Wrapper>
                <label>Amount in eth</label>
                <input placeholder='1' value={transferFromAmount} onChange={e => setTransferFromAmount(e.target.value)}/>
                <label>From</label>
                <input placeholder="address" value={transferFromAddress} onChange={e => setTransferFromAddress(e.target.value)}/>
                <label>To</label>
                <input placeholder="address" value={transferToAddress} onChange={e => setTransferToAddress(e.target.value)}/>
                <CreateToken onClick={() => transferFrom()}>Transfer</CreateToken>
            </Wrapper>
        </div>
    )
}

export default ERC20Creating