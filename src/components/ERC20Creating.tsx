import React, {FC, useEffect, useState} from 'react'
import styled from "styled-components";
import ERCToken from '../artifacts/src/contracts/CreateERC20.sol/ERC20Token.json'

//API
import {applyDecimals} from "../utils/ethereumAPI";
import {ethers} from "ethers";
import {BigNumber} from "ethers";
import {address} from "hardhat/internal/core/config/config-validation";
import {getSigner} from "@nomiclabs/hardhat-ethers/internal/helpers";

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
`
const InputWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const CreateToken = styled.button`
  background-color: blueviolet;
  color: #fff;
  border: none;
  font-weight: 500;
  padding: 5px 40px;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 10px;
`
const TokenWrap = styled.div`
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

    //Mint
    const [balance, setBalance] = useState<string>()
    const [amount, setAmount] = useState("")
    //Transfer
    const [transferAmount, setTransferAmount] = useState('')
    const [transferAddress, setTransferAddress] = useState<string>('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
    //TransferFrom
    const [transferFromAddress, setTransferFromAddress] = useState<string>()
    const [transferFromAmount, setTransferFromAmount] = useState<string>()
    const [transferToAddress, setTransferToAddress] = useState<string>()
    const [transferFromSignature, setTransferFromSignature] = useState<string>()
    //Import contract
    const [contractAddress, setContractAddress] = useState<string>()
    const [importedContract, setImportedContract] = useState<string>()
    //Formats
    const [format, setFormat] = useState<string>('ether')

    //Signature
    //const [signature, setSignature] = useState<any>()
    const [signature, setSignature] = useState<any>()
    const [signatureSender, setSignatureSender] = useState<string>()
    const [signatureAmount, setSignatureAmount] = useState<string>()
    //Approve
    const [approveAddress, setApproveAddress] = useState<string>()
    const [erc20, setErc20] = useState<ethers.Contract>();
    const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>();
    const [walletAddress, setWalletAddress] = useState<string>()
    const [signatureMessage, setSignatureMessage] = useState<string>()
    //Deploy

    const deployExistingContract = async () => {
        if (!importedContract) return
        try {
            setSigner(await provider.getSigner());
            const ERC20 = new ethers.Contract(importedContract, abi, signer)
            setErc20(ERC20)
            console.log(erc20)
        } catch (e) {
            console.log(e)
        }
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const createToken = async () => {
        if (!window.ethereum) return
        try {
            setSigner(await provider.getSigner());
            const CreateERC20 = new ethers.ContractFactory(abi, ERCToken.bytecode, signer)
            const address = await signer!.getAddress()
            const ERC20 = await CreateERC20.deploy()
            setContractAddress(ERC20.address)
            const tx = await ERC20.mint({value: formatConvertor(amount)});
            const txResult = await tx.wait();
            const balance = await ERC20.balances(address)
            setErc20(ERC20);
            setBalance(ethers.utils.formatEther(balance))
            console.log(signer)
            console.log("createToken balance:", balance);
        } catch (e) {
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
        } catch (e) {
            console.log(e)
        }
    }
    const getBalance = async () => {
        try {
            console.log(erc20);
            const balance = await erc20!.balances(await signer!.getAddress());
            setBalance(ethers.utils.formatEther(balance))
            console.log("balance2:", balance);
        } catch (e) {
            console.log(e)
        }
    }
    const transfer = async () => {
        try {
            setSigner(await provider.getSigner())
            const address = await signer!.getAddress()
            const tx = await erc20!.transfer(transferAddress, formatConvertor(transferAmount))
            const txResult = await tx.wait()
            //Update balance
            const balance = await erc20!.balances(address)
            console.log(balance)
            setBalance(ethers.utils.formatEther(balance))
        } catch (e) {
            console.log(e)
        }
    }
    const transferFrom = async () => {
        try {
            const address = await signer!.getAddress();
            console.log(`transferFrom address: ${transferFromAddress}`, `transferTo address ${transferToAddress}`)
            //signature bytes mem
            console.log(importedContract)
            const tx = await erc20!.transferFrom(
                transferFromAddress,
                transferToAddress,
                formatConvertor(transferFromAmount),
                transferFromSignature
            );
            const txResult = await tx.wait();
            const balance = await erc20!.balances(address)
            setBalance(ethers.utils.formatEther(balance))
            console.log("After transferFrom: ", balance);
        } catch (e) {
            console.log(e)
            alert('You dont have permission to use it')
        }
    }

    const getData = async () => {
        let signer = await provider.getSigner()
        setSigner(signer)
        let address = await signer.getAddress()
        setWalletAddress(address)

    }

    useEffect(() => {
        if (!signer) {
            getData()
        }
    })

    function formatConvertor(amount: any) {
        let ether
        if (format === 'ether') {
            ether = BigNumber.from(applyDecimals(amount));
        }
        if (format === 'wei') {
            ether = BigNumber.from(amount);
        }
        return ether
    }

    const signMessage = async (amount: string, sender: string) => {

        try {
            console.log(`${sender}${formatConvertor(amount)}${contractAddress}`)
            const encodedData = ethers.utils.defaultAbiCoder.encode(
                ['address', 'uint256', 'address'],
                [sender, formatConvertor(amount), contractAddress]
            )
            const message = ethers.utils.arrayify(ethers.utils.keccak256(encodedData));
            const signature = await signer?.signMessage(message);
            setSignature(signature)
        }
        catch (e) {
            console.log(e)
        }
    }

    const approve = async () => {
        try {
            console.log('Approve address: ', approveAddress)
            console.log('signature: ')
            const tx = await erc20!.approve(approveAddress);
            const txResult = await tx.wait()
            console.log(txResult)
        } catch (e) {
            console.log(e)
        }
    }
    //Contract address
    //My wallet _> owner
    //Friend wallet
    //Amount
    //---> sending to contract (wallet) meta transaction
    return (
        <div>
            <h2>Import Contract</h2>
            <label>Contract Address</label>
            <input value={importedContract} onChange={e => setImportedContract(e.target.value)}/>
            <CreateToken onClick={() => deployExistingContract()}>Import</CreateToken>
            {contractAddress && (<h4>Contract address: {contractAddress}</h4>)}
            {balance ? (<h1>Token balance: {balance}</h1>) : (<h1>Create your own Token!</h1>)}
            <CreateToken onClick={() => getBalance()}>Get Balance</CreateToken>
            <Wrapper>
                <h3>I'd like to use: {format}</h3>
                <CreateToken onClick={() => {
                    format !== 'wei' && setFormat('wei')
                    format !== 'ether' && setFormat('ether')
                }}>Change</CreateToken>
            </Wrapper>
            <Wrapper>
                <CreateToken onClick={() => createToken()}>Create</CreateToken>
                <input value={amount} onChange={e => setAmount(e.target.value)}/>
                <CreateToken onClick={() => burnToken()}>Burn All</CreateToken>
            </Wrapper>
            <h1>Transfer</h1>
            <Wrapper>
                <label>Amount in {format}</label>
                <input value={transferAmount} onChange={e => setTransferAmount(e.target.value)}/>
                <label>To</label>
                <input placeholder="address" value={transferAddress}
                       onChange={e => setTransferAddress(e.target.value)}/>
                <CreateToken onClick={() => transfer()}>Transfer</CreateToken>
            </Wrapper>
            <h1>Approve Address</h1>
            <Wrapper>
                <input placeholder='White list address' value={approveAddress}
                       onChange={e => setApproveAddress(e.target.value)}/>
                <CreateToken onClick={() => approve()}>Approve</CreateToken>
            </Wrapper>
            <h1>TransferFrom</h1>
            <Wrapper>
                <label>Amount in {format}</label>
                <input value={transferFromAmount} onChange={e => setTransferFromAmount(e.target.value)}/>
                <label>From</label>
                <input placeholder="address" value={transferFromAddress}
                       onChange={e => setTransferFromAddress(e.target.value)}/>
                <label>To</label>
                <input placeholder="address" value={transferToAddress}
                       onChange={e => setTransferToAddress(e.target.value)}/>
                <label>Signature</label>
                <input placeholder="address" value={transferFromSignature}
                       onChange={e => setTransferFromSignature(e.target.value)}/>
                <CreateToken onClick={() => transferFrom()}>Transfer</CreateToken>
            </Wrapper>
            <Wrapper>
                <h3>Create signature</h3>
                <input placeholder="sender" value={signatureSender} onChange={e => setSignatureSender(e.target.value)}/>
                <input placeholder="amount" value={signatureAmount} onChange={e => setSignatureAmount(e.target.value)}/>
                <CreateToken onClick={() => signMessage(signatureAmount!, signatureSender!)}>Create</CreateToken>
            </Wrapper>
            <h1>{signature}</h1>
        </div>
    )
}

export default ERC20Creating