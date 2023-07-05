// src/pages/index.tsx
import type { NextPage } from 'next'
import Head from 'next/head'
import NextLink from "next/link"
import { VStack, Heading, Box, LinkOverlay, LinkBox} from "@chakra-ui/layout"
import { Text, Button, Flex} from '@chakra-ui/react'
import { useState, useEffect} from 'react'
import {ethers, Contract} from "ethers"

import ReadERC20 from "components/ReadERC20"
import TransferERC20 from "components/TransferERC20"

import {FactoryABI as factoryabi} from '../abi/FactoryABI'
import CreateERC20 from 'components/CreateERC20'


declare let window:any
// const addressERC20 = '0x216e4e565BA7fb9cB3f878AFA789f4f33a12Bd8C'

const factoryAddress = "0x69D6FB1C15AAdAd7f43d1e83c4b230c7Fb9C6e9F"


const Home: NextPage = () => {
  const [balance, setBalance] = useState<string | undefined>()
  const [currentAccount, setCurrentAccount] = useState<string | undefined>()
  const [chainId, setChainId] = useState<number | undefined>()
  const [chainname, setChainName] = useState<string | undefined>()
  const [tokens, setTokens] = useState<string[]>([]);


  useEffect(() => {
    //get ETH balance and network info only when having currentAccount 
    if(!currentAccount || !ethers.utils.isAddress(currentAccount)) return

    //client side code
    if(!window.ethereum) {
      console.log("please install MetaMask")
      return
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const factory:Contract = new ethers.Contract(factoryAddress, factoryabi, provider);
    factory.allToken().then((result:any)=>{

      console.log("FACTORYYYY INDEX", result); 
      setTokens(result)
      result.map((i:any)=>{
        console.log("tokens", i)
      });
  })

    provider.getBalance(currentAccount).then((result)=>{
      setBalance(ethers.utils.formatEther(result))
    }).catch((e)=>console.log(e))

    provider.getNetwork().then((result)=>{
      setChainId(result.chainId)
      setChainName(result.name)
    }).catch((e)=>console.log(e))

  },[currentAccount])

  //click connect
  const onClickConnect = () => {
    //client side code
    if(!window.ethereum) {
      console.log("please install MetaMask")
      return
    }
    /*
    //change from window.ethereum.enable() which is deprecated
    //call window.ethereum.request() directly
    window.ethereum.request({ method: 'eth_requestAccounts' })
    .then((accounts:any)=>{
      if(accounts.length>0) setCurrentAccount(accounts[0])
    })
    .catch('error',console.error)
    */

    //we can do it using ethers.js
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    provider.send("eth_requestAccounts", [])
    .then((accounts)=>{
      console.log("i am working")
      if(accounts.length>0) setCurrentAccount(accounts[0])
    }).catch((e)=>console.log(e))

  }

  //click disconnect
  const onClickDisconnect = () => {
    console.log("onClickDisConnect")
    setBalance(undefined)
    setCurrentAccount(undefined)
  }

  return (
    <>
      <Head>
        <title>Tech Alchemy</title>
      </Head>

      <Heading as="h3"  my={4} bgGradient='linear(to-l, #7928CA, #FF0080)' bgClip='text' fontSize='6xl' fontWeight='extrabold'> Token Alchemy Platform</Heading>
      <VStack>
        <Box boxShadow="Dark lg" w='100%' my={4}>
        {currentAccount  
          ? <Button type="button" w='100%' onClick={onClickDisconnect}>
                Account:{currentAccount}
            </Button>
          : <Button type="button" w='100%' onClick={onClickConnect}>
                  Connect MetaMask
              </Button>
        }
        </Box>


        {currentAccount  
          ?<Box boxShadow="xl" mb={0} p={4} w='100%' borderWidth="1px" borderRadius="lg" bgGradient='linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 40%, #ffffff 100%);'>
          <Heading my={4}  fontSize='xl'>Account info</Heading>
          <Text>ETH Balance of current account: {balance}</Text>
          <Text>Chain Info: ChainId {chainId} name {chainname}</Text>
        </Box>
        :<></>
        }



        <Flex>


        <Box boxShadow="md" mb={5} p={4} w='100%' borderWidth="1px" marginRight={2} m={3} ml={0} borderRadius="lg" >
          <Heading my={4}  fontSize='xl'>Transfer Tokens</Heading>
          <TransferERC20 
            currentAccount={currentAccount}
          />
        </Box>

        <Box boxShadow="md" mb={5} p={4} w='100%' borderWidth="1px" marginLeft={2} m={3} mr={0} borderRadius="lg">
          <Heading my={4}  fontSize='xl'>Create your own ERC20 Token</Heading>
          <CreateERC20 
            currentAccount={currentAccount}
          />
        </Box>

        </Flex>


        { tokens && 
                  <Box bgGradient="linear-gradient(0deg, #D9AFD9 0%, #97D9E1 100%);" mt={2} p={4} w='100%' borderWidth="1px" borderRadius="lg">
                  <Heading my={4}  fontSize='xl'>Token Listing...</Heading>
                      
                      {tokens.map((token, index) => (
                        <ReadERC20 
                          key={index}
                          addressContract={token}
                          currentAccount={currentAccount}
                        /> 
                        // <h1>CHeck {token}</h1>
                        ))}

                 
                </Box>
        }

      </VStack>
    </>
  )
}

export default Home
