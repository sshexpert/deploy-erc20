import React, {FC, useState} from 'react'
import styled from "styled-components";
import ERCToken from '../artifacts/src/contracts/CreateERC20.sol/ERC20Token.json'

//API
import {applyDecimals} from "../utils/ethereumAPI";
import {ethers} from "ethers";
import {BigNumber} from "ethers";
import {address} from "hardhat/internal/core/config/config-validation";

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
    //Mint
    const [balance, setBalance] = useState<string>()
    const [amount, setAmount] = useState("1000000000000000000")
    //Transfer
    const [transferAmount, setTransferAmount] = useState('1000000000000000000')
    const [transferAddress, setTransferAddress] = useState<string>('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
    //TransferFrom
    const [transferFromAddress, setTransferFromAddress] = useState<string>()
    const [transferFromAmount, setTransferFromAmount] = useState<string>()
    const [transferToAddress, setTransferToAddress] = useState<string>()

    //Approve
    const [approveAddress, setApproveAddress] = useState<string>()

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let erc20: ethers.Contract;
    let signer: any
    const createToken = async () => {
        if (!window.ethereum) return
        try {
            const ether = BigNumber.from(amount);
            signer = await provider.getSigner()
            const CreateERC20 = new ethers.ContractFactory(abi, ERCToken.bytecode, signer)
            const address = await signer.getAddress()
            const ERC20 = await CreateERC20.deploy()
            const tx = await ERC20.mint({value: ether});
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
    const transfer = async () => {
        try {
            const ether = BigNumber.from(transferAmount);
            signer = await provider.getSigner()
            const address = await signer.getAddress()
            const ERC20 = new ethers.ContractFactory(abi, ERCToken.bytecode, signer)
            const createTransfer = await ERC20.deploy()
            const tx = await createTransfer.transfer(transferAddress, ether)
            const txResult = await tx.wait()
            //Update balance
            const balance = await createTransfer.balances(address)
            console.log(balance)
            setBalance(ethers.utils.formatEther(balance))
        }
        catch (e) {
            console.log(e)
        }
    }

    const transferFrom = async () => {
        try {
            const ether = BigNumber.from(transferFromAmount);
            signer = await provider.getSigner()
            const CreateERC20 = new ethers.ContractFactory(abi, ERCToken.bytecode, signer)
            //const address = await signer.getAddress()
            const ERC20 = await CreateERC20.deploy()
            const tx = await ERC20.transferFrom(transferFromAddress, transferToAddress, ether);
            const txResult = await tx.wait();
            const balance = await ERC20.balances(transferFromAddress)
            erc20 = ERC20;
            console.log("balance1:", balance);
        }
        catch (e) {
            console.log(e)
        }
    }

    const approve = async () => {
        try {
            signer = await provider.getSigner()
            const CreateERC20 = new ethers.ContractFactory(abi, ERCToken.bytecode, signer)
            const ERC20 = await CreateERC20.deploy()
            const tx = await ERC20.approve(approveAddress);
            const txResult = await tx.wait()
            console.log(txResult)
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
                <CreateToken onClick={() => burnToken()}>Burn All</CreateToken>
            </Wrapper>
            <h1>Transfer</h1>
            <Wrapper>
                <label>Amount</label>
                <input placeholder={defaultInitialSupply} value={transferAmount} onChange={e => setTransferAmount(e.target.value)}/>
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
                <label>Amount</label>
                <input placeholder={defaultInitialSupply} value={transferFromAmount} onChange={e => setTransferFromAmount(e.target.value)}/>
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