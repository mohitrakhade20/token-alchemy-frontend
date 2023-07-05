// src/components/ReadERC20.tsx
import React, {useEffect, useState } from 'react'
import {Text, border, Box, Button, ArrowForwardIcon} from '@chakra-ui/react'
import {ERC20ABI as abi} from 'abi/ERC20ABI'
import {FactoryABI as factoryabi} from 'abi/FactoryABI'
import {ethers} from 'ethers'
import { Contract } from "ethers"

interface Props {
    addressContract: string,
    currentAccount: string | undefined
}

declare let window: any

export default function ReadERC20(props:Props){
  const addressContract = props.addressContract
  const currentAccount = props.currentAccount
  const [totalSupply,setTotalSupply]=useState<string>()
  const [symbol,setSymbol]= useState<string>("")
  const [name,setName]= useState<string>("")
  const [balance, SetBalance] =useState<number|undefined>(undefined)
  const [tokens, setTokens] = useState<string[]>([]);
  const factoryAddress = "0x69D6FB1C15AAdAd7f43d1e83c4b230c7Fb9C6e9F"

  useEffect( () => {
    if(!window.ethereum) return

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const erc20:Contract = new ethers.Contract(addressContract, abi, provider);
    const factory:Contract = new ethers.Contract(factoryAddress, factoryabi, provider);

    provider.getCode(addressContract).then((result:string)=>{
      //check whether it is a contract
      if(result === '0x') return
    
      erc20.symbol().then((result:string)=>{
          setSymbol(result)
      }).catch((e:Error)=>console.log(e))

      erc20.name().then((result:string)=>{
        setName(result)
    }).catch((e:Error)=>console.log(e))

      erc20.totalSupply().then((result:string)=>{
          setTotalSupply(ethers.utils.formatEther(result))
      }).catch((e:Error)=>console.log(e))

      factory.allToken().then((result:any)=>{

          console.log("FACTORYYYY", result); 
          setTokens(result)
          result.map((i:any)=>{
            console.log("tokens", i)
          });
      })

    })
    //called only once
  },[])  

  //call when currentAccount change
  useEffect(()=>{
    if(!window.ethereum) return
    if(!currentAccount) return

    queryTokenBalance(window)

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const erc20:Contract = new ethers.Contract(addressContract, abi, provider)

    // listen for changes on an Ethereum address
    console.log(`listening for Transfer...`)

    const fromMe = erc20.filters.Transfer(currentAccount, null)
    erc20.on(fromMe, (from, to, amount, event) => {
        console.log('Transfer|sent',  {from, to, amount, event} )
        queryTokenBalance(window)
    })

    const toMe = erc20.filters.Transfer(null, currentAccount)
    erc20.on(toMe, (from, to, amount, event) => {
        console.log('Transfer|received',  {from, to, amount, event} )
        queryTokenBalance(window)
    })

    // remove listener when the component is unmounted
    return () => {
        erc20.removeAllListeners(toMe)
        erc20.removeAllListeners(fromMe)
    }    
  }, [currentAccount])

  async function queryTokenBalance(window:any){
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const erc20:Contract = new ethers.Contract(addressContract, abi, provider);

    erc20.balanceOf(currentAccount)
    .then((result:string)=>{
        SetBalance(Number(ethers.utils.formatEther(result)))
    }).catch((e:Error)=>console.log(e))
  }

  return (
    <div>
        {/* { tokens && 
            <ul>

            {
              tokens.map((token, index) => (
                
                <li key={index}> Heading {token} </li>
              ))
            }
            </ul>

        } */}
        <Box  mb={5} p={4} w='100%' borderWidth="1px" borderRadius="lg" backgroundColor="ButtonHighlight">
          <Text><b>ERC20 Contract</b>: {name}</Text>
          <Text><b>Contract Address</b>: {addressContract}</Text>
          <Text><b>TotalSupply</b>:{totalSupply} {symbol}</Text>
          <Text my={2}><b>{symbol} in current account</b>: {balance} {symbol}</Text>
          <a href={`https://sepolia.etherscan.io/token/${addressContract}`} target="_blank" rel="noopener noreferrer">
            <Button colorScheme='teal' variant='outline' size='xs'  >See it on Etherscan</Button>
          </a>
        </Box>
    </div>
  )
}
