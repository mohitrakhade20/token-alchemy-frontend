// src/components/TransferERC20.tsx
import React, { useState } from 'react'
import {Button, Input , NumberInput,  NumberInputField,  FormControl,  FormLabel, Flex, Spacer} from '@chakra-ui/react'
import {ethers} from 'ethers'
import {parseEther } from 'ethers/lib/utils'
import {ERC20ABI as abi} from 'abi/ERC20ABI'
import { Contract } from "ethers"
import { TransactionResponse,TransactionReceipt } from "@ethersproject/abstract-provider"
import { FactoryABI } from 'abi/FactoryABI'

interface Props {
    // addressContract: string,
    currentAccount: string | undefined
}
const factoryAddress = "0x69D6FB1C15AAdAd7f43d1e83c4b230c7Fb9C6e9F"


declare let window: any;

export default function CreateERC20(props:Props){
  // const addressContract = props.addressContract
  const currentAccount = props.currentAccount
  const [name,setName]=useState<string>('Trash Coin')
  const [symbol, setSymbol]=useState<string>("")
  const [totalSupply,setTotalSupply]=useState<string>('100000000000000000')

  const [addressContract, setAddressContract] =useState<string>("")

  async function create(event:React.FormEvent) {
    event.preventDefault()
    if(!window.ethereum) return    
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const erc20:Contract = new ethers.Contract(addressContract, abi, signer)
    const factory:Contract = new ethers.Contract(factoryAddress, FactoryABI, signer)

    
    factory.deployToken(name, symbol, totalSupply)
      .then((tr: TransactionResponse) => {
        console.log(`TransactionResponse TX hash: ${tr.hash}`)
        tr.wait().then((receipt:TransactionReceipt)=>{console.log("transfer receipt",receipt)})
      })
      .catch((e:Error)=>console.log(e))

  }

  const handleChange = (value:string) => setTotalSupply(value)

  return (
    <form onSubmit={create}>
    <FormControl>
      {/* <Flex > */}
        <div>
        <FormLabel htmlFor='name'>Name: </FormLabel>
        <Input id="name" type="text" required   onChange={(e) => setName(e.target.value)} my={1}/>
        </div>



        <div>
        <FormLabel htmlFor='symbol'>Symbol: </FormLabel>
        <Input id="symbol" type="text" required  onChange={(e) => setSymbol(e.target.value)} my={1}/>

        </div>


      {/* </Flex> */}
    
      <FormLabel htmlFor='totalSupply'>Total Supply</FormLabel>
      <NumberInput defaultValue={totalSupply} min={100000000000000000} max={1000000000000000000000000000000} onChange={handleChange} my={5}>
          <NumberInputField />
        </NumberInput>
      <Button type="submit" isDisabled={!currentAccount}>Create Token</Button>
    </FormControl>
    </form>
  )
}
