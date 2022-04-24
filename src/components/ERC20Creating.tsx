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

    const [tokeName, setTokenName] = useState<string>('')
    const [tokeSymbol, setTokenSymbol] = useState<string>('')
    const [tokenInitialSupply, setTokenInitialSupply] = useState(defaultInitialSupply);
    const [tokenInfo, setTokenInfo] = useState<ITokenInfo>()

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let erc20: ethers.Contract;
    let signer: any
    const createToken = async () => {
        if (!window.ethereum) return
        try {
            const oneEther = BigNumber.from("1000000000000000000");
            signer = await provider.getSigner()
            const CreateERC20 = new ethers.ContractFactory(abi, ERCToken.bytecode, signer)
            const address = await signer.getAddress()
            const ERC20 = await CreateERC20.deploy()
            const tx = await ERC20.mint(address, {value: oneEther});
            const txResult = await tx.wait();
            const balance = await ERC20.balances(address)
            erc20 = ERC20;
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
            const ERC20BurnToken = new ethers.ContractFactory(abi, ERCToken.bytecode, signer)
            const burnToken = await ERC20BurnToken.deploy()
            await burnToken.burn(address)
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
            <Wrapper>
                <InputWrap>
                    <label>Name</label>
                    <input placeholder="GOLD" onChange={(e) => setTokenName(e.target.value)}/>
                </InputWrap>
                <InputWrap>
                    <label>Symbol</label>
                    <input placeholder="GLD" onChange={(e) => setTokenSymbol(e.target.value)}/>
                </InputWrap>
                <InputWrap>
                    <label>Initial supply (raw)</label>
                    <input
                        placeholder={defaultInitialSupply}
                        /*value={setTokenInitialSupply(defaultInitialSupply)}*/
                        /*onChange={e => setTokenInitialSupply(e.target.value)}*/
                    />
                </InputWrap>
                <InputWrap>
                    <label>Initial supply (adjusted)</label>
                    <input
                        placeholder="1"
                        value={applyDecimals(tokenInitialSupply, defaultDecimals)}
                    />
                </InputWrap>
                <InputWrap>
                    <label>Decimals</label>
                    <input
                        placeholder={defaultDecimals}
                        value={defaultDecimals}
                    />
                </InputWrap>
                <CreateToken onClick={() => createToken()}>Create</CreateToken>
                <CreateToken onClick={() => getContractBalance()}>Get balance of Contract</CreateToken>
                <CreateToken onClick={() => burnToken()}>Burn</CreateToken>
            </Wrapper>
            <TokenWrap>
                <h3>Token Name: {tokenInfo?.name}</h3>
                <h3>Token Symbol: {tokenInfo?.symbol}</h3>
                <h3>Total Supply: {tokenInfo?.totalSupply}</h3>
            </TokenWrap>
        </div>
    )
}

export default ERC20Creating