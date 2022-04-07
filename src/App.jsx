import "./App.css";
import { Web3ReactProvider, useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { ethers } from "ethers";
import BUSD from "./contracts/BUSD.json";
import { Web3Provider } from "@ethersproject/providers";
import { formatEther } from "@ethersproject/units";
import { useEffect, useState, useRef } from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";
import ChangeChainModal from "./components/ChangeChainModal/ChangeChainModal.jsx";
import { useFormik, Formik } from "formik";
import { chainNetworks } from "./assets/utils";

// const abi = contract.abi;
export default function DappWrapper() {
  return (
    <Web3ReactProvider getLibrary={(provider) => new Web3Provider(provider)}>
      <App />
    </Web3ReactProvider>
  );
}

export const injectedConnectors = new InjectedConnector({
  supportedChainIds: [
    chainNetworks.MainNet, // Mainet
    chainNetworks.Ropsten, // Ropsten
    chainNetworks.Rinkeby, // Rinkeby
    chainNetworks.Goerli, // Goerli
    chainNetworks.Kovan, // Kovan,
    chainNetworks.SmartChain, // SmartChain
    chainNetworks.Polygon, // Polygon
    chainNetworks.Mumbai, // Polygon Test Net
  ],
});

export const TOKENS_BY_NETWORK = {
  [chainNetworks.MainNet]: [
    {
      address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
      name: "Matic Token",
      symbol: "MATIC",
      decimals: 18,
      totalSuply: 10000000000000000000000000000,
    },
    {
      address: "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
      name: "Binance USD",
      symbol: "BUSD",
      decimals: 18,
      totalSuply: 17911718329560000000000000000,
    },
  ],
  [chainNetworks.SmartChain]: [
    {
      address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
      name: "Matic Token",
      symbol: "MATIC",
      decimals: 18,
      totalSuply: 10000000000000000000000000000,
    },
    {
      address: "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
      name: "Binance USD",
      symbol: "BUSD",
      decimals: 18,
      totalSuply: 17911718329560000000000000000,
    },
  ],
  [chainNetworks.Polygon]: [
    {
      address: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
      name: "Matic Token",
      symbol: "MATIC",
      decimals: 18,
    },
    {
      address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      name: "BUSD Token",
      symbol: "BUSD",
      decimals: 18,
      totalSuply: 4850999328629409465655005513,
    },
  ],
  [chainNetworks.Mumbai]: [
    {
      address: "0x0000000000000000000000000000000000001010",
      name: "Matic Token",
      symbol: "MATIC",
      decimals: 18,
    },
    {
      address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      name: "BUSD Token",
      symbol: "BUSD",
      decimals: 18,
      totalSuply: 4850999328629409465655005513,
    },
  ],
};

// function to get balance for wallet
function useBalance() {
  const { account, library } = useWeb3React(); // what was passed to the provider <Web3ReactProvider ==> Web3Provider from ethers
  const [balance, setBalance] = useState();

  useEffect(() => {
    if (account) {
      // we are active
      library.getBalance(account).then((val) => setBalance(val)); // promice to get balance
    }
  }, [account, library]);
  return balance ? formatEther(balance) : null;
}

// function to update the block number
function useBlockNumber() {
  const { library } = useWeb3React();
  const [blockNumber, setBlockNumber] = useState();

  useEffect(() => {
    if (library) {
      const updateBlockNumber = (val) => setBlockNumber(val);
      library.on("block", updateBlockNumber);
      // return () => {
      //   library.removeEventListener("block", updateBlockNumber);
      // };
    }
  }, [library]);
  //   console.log("use effect block number");
  return blockNumber;
}

// function to perform network or chain change
function useNetworkChange() {
  const networkChanged = (chainId) => {
    console.log({ chainId });
  };
  useEffect(() => {
    window.ethereum.on("chainChanged", networkChanged);

    return () => {
      window.ethereum.removeListener("chainChanged", networkChanged);
    };
  }, []);
}

function App() {
  const { active, account, activate, deactivate, chainId } = useWeb3React(); // active false / no account initial state / function we call connect metamask
  const balance = useBalance();
  const mainProvider = new ethers.providers.Web3Provider(window.ethereum);
  const [contractInfo, setContractInfo] = useState([]);
  // maintain the state of connected if user hasn't disconnected
  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      if (localStorage?.getItem("metamask-userConnected") === "true") {
        try {
          await activate(injectedConnectors);
        } catch (ex) {
          console.log(ex);
        }
      }
    };
    connectWalletOnPageLoad();
  }, []);

  async function disconnect() {
    try {
      await deactivate();
      localStorage.removeItem("metamask-userConnected");
    } catch (ex) {
      console.error(ex);
    }
  }

  const currentNetwork = useNetworkChange();
  const target = useRef(null);

  const blockNumber = useBlockNumber();
  const chainNames = [
    { id: 1, name: "Eth Mainnet" },
    { id: 56, name: "Smart Chain" },
    { id: 137, name: "Polygon" },
    { id: 80001, name: "Polygon Testnet(Mumbai)" },
  ];

  let erc20Contract;

  // on utilise Mumbai testnet 80001 / 0x15A40d37e6f8A478DdE2cB18c83280D472B2fC35 BUSD token
  async function getContractAndBalanceInfo(erc20Address) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    erc20Contract = new ethers.Contract(erc20Address, BUSD.abi, provider);

    const tokenName = await erc20Contract.name();
    const tokenSymbol = await erc20Contract.symbol();
    const totalSupply = formatEther(await erc20Contract.totalSupply());

    // await provider;
    const signer = await provider.getSigner(); //jsonRpc
    const signerAddress = await signer.getAddress();

    const balance = formatEther(await erc20Contract.balanceOf(signerAddress));
    const allowance = await erc20Contract.allowance(
      erc20Address,
      signerAddress
    );

    const newContractInfos = [...contractInfo];
    console.log(contractInfo);
    newContractInfos.push({
      contractAddress: erc20Address,
      tokenName,
      tokenSymbol,
      totalSupply: totalSupply,
      accountAddress: signerAddress,
      balance: balance,
      allowance: ethers.utils.formatEther(allowance) > 0,
    });
    console.log(newContractInfos);
    setContractInfo(newContractInfos);
  }

  //check allowance of spender
  async function setGrantApproval(data) {
    await mainProvider.send("eth_requestAccounts", []);
    const signer = await mainProvider.getSigner();
    const getSignerAddr = signer.getAddress();
    const contract = new ethers.Contract(
      contractInfo[0].accountAddress,
      BUSD.abi,
      signer
    );

    console.log(contractInfo[0]);
    console.log(data.valueToApprove);
    const grantApproval = await contract.approve(
      getSignerAddr,
      data.valueToApprove
    );

    console.log(grantApproval);
    // return parseInt(checkAllowance, 10) > 0;
  }

  // addr to send 0x9B678D348821d48D77a586DAbd1B5C394B4cA5f8
  const [transferHash, setTransferHash] = useState("");
  async function sendAmountToAddress(data) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    // const maticAddr = contractInfo.find(
    //   (info) =>
    //     info.contractAddress === "0x0000000000000000000000000000000000001010"
    // );

    const contract = new ethers.Contract(
      "0x15A40d37e6f8A478DdE2cB18c83280D472B2fC35",
      BUSD.abi,
      signer
    );

    // contract.methods.console.log(
    //   `sending ${data.amountOfTransfer} to ${data.recipientAddress} `
    // );
    const txt = await contract.transfer(
      data.recipientAddress,
      ethers.utils.parseUnits(data.amountOfTransfer)
    );
    setTransferHash(txt.hash);
  }

  async function checkIfOwner() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      "0x15A40d37e6f8A478DdE2cB18c83280D472B2fC35",
      BUSD.abi,
      signer
    );
    const isOwner = await contract.getOwner().then((res) => {
      console.log(res);
      return res;
    });
  }

  const formik = useFormik({
    initialValues: {
      erc20ContractAddress: "",
    },
    onSubmit: async (values) => {
      getContractAndBalanceInfo(values.erc20ContractAddress);
    },
  });

  return (
    <>
      <header>
        <Navbar bg="light" expand="lg">
          <Container>
            <Navbar.Brand>Smart Contract App </Navbar.Brand>
            {active ? (
              <Nav>
                <Nav.Item>
                  <ChangeChainModal />
                </Nav.Item>
              </Nav>
            ) : null}
            <Form>
              {active ? (
                <div className="d-flex  gap-3 justify-content-around ">
                  <Button className="metamask-btn " variant="outline-secondary">
                    Account {account}
                  </Button>

                  <Button
                    variant="outline-warning"
                    onClick={() => disconnect()}
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div>
                  <Button
                    variant="primary"
                    onClick={() => {
                      activate(injectedConnectors);
                      localStorage.setItem("metamask-userConnected", "true");
                    }}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </Form>
          </Container>
        </Navbar>
      </header>
      <main>
        {active ? (
          <div>
            <div className="container">
              <h2 className="text-center">Metamask connected</h2>
            </div>
            <Card className="container mb-4">
              <Card.Body>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ChainId</th>
                      <th>Block Number</th>
                      <th>Chain Name</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chainId != null ? (
                      <tr>
                        <td>{chainId}</td>
                        <td>{blockNumber}</td>
                        <td>
                          {chainNames.find((chain) => {
                            return chain.id === chainId;
                          }).name ?? "Not supported chain"}
                        </td>
                        <td>{balance}</td>
                      </tr>
                    ) : (
                      <tr>
                        <td>0</td>
                        <td>#</td>
                        <td>Empty</td>
                        <td>Empty</td>
                      </tr>
                    )}
                    <tr></tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
            <Card className="container mb-4">
              <Card.Body>
                <div className="row">
                  <Form
                    className="d-flex flex-column  justify-content-md-between"
                    onSubmit={formik.handleSubmit}
                  >
                    <Form.Label className="mt-2 mb-2 h4">
                      Insert contract address
                    </Form.Label>
                    <Form.Control
                      type="text"
                      id="erc20ContractAddress"
                      name="erc20ContractAddress"
                      onChange={formik.handleChange}
                      placeholder="ERC20 contract address"
                      value={formik.values.erc20ContractAddress}
                    />
                    <Button
                      className="mt-2 mb-2 align-self-left col-md-4"
                      variant="primary"
                      type="submit"
                    >
                      Submit
                    </Button>
                  </Form>
                </div>
                <h3> Contract Info </h3>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Contract address</th>
                      <th>Total Balance of Account</th>
                      <th>Token</th>
                      <th>Total Supply</th>
                      <th>Check allowance of spender</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contractInfo.length > 0 &&
                    contractInfo[0].contractAddress !== "" ? (
                      contractInfo.map((info) => (
                        <tr key={info.tokenName}>
                          <td>{info.contractAddress}</td>
                          <td>{info.balance}</td>
                          <td>
                            {info.tokenName} ({info.tokenSymbol})
                          </td>
                          <td>{info.totalSupply}</td>
                          <td>{info.allowance ? "yes" : "no"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td>0</td>
                        <td>#</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                      </tr>
                    )}
                    <tr></tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
            <Card className="container">
              <Card.Body>
                <h4>Smart Contract interactions</h4>
                <div className="container">
                  <Formik
                    initialValues={{
                      recipientAddress: "",
                      amountOfTransfer: 0,
                    }}
                    className="d-flex flex-column  justify-content-md-between"
                    onSubmit={(data, { setSubmitting }) => {
                      setSubmitting(true);
                      // send data to the contract

                      sendAmountToAddress(data);
                      setSubmitting(false);
                    }}
                  >
                    {({
                      values,
                      isSubmitting,
                      handleChange,
                      handleBlur,
                      handleSubmit,
                    }) => (
                      <form onSubmit={handleSubmit}>
                        <div className="row">
                          <Form.Label className="mt-2 mb-2 h4">
                            Send tokens
                          </Form.Label>
                        </div>
                        <div className="row">
                          <div className="col-6">
                            <Form.Control
                              type="text"
                              id="recipientAddress"
                              name="recipientAddress"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="Recipient address"
                              value={values.recipientAddress}
                            />
                          </div>
                          <div className="col-6">
                            <Form.Control
                              type="text"
                              id="amountOfTransfer"
                              name="amountOfTransfer"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="amount of tokens"
                              value={values.amountOfTransfer}
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-6">
                            <Button
                              disabled={contractInfo.length === 0}
                              className="mt-2 mb-2 align-self-center col-md-4"
                              variant="primary"
                              type="submit"
                            >
                              Send
                            </Button>
                          </div>
                          <div className="col-6 pt-2">
                            <div className="h6">
                              Transaction hash:{transferHash}
                            </div>
                          </div>
                        </div>
                      </form>
                    )}
                  </Formik>
                </div>

                <div className="container">
                  <div className="row">
                    <Formik
                      initialValues={{ valueToApprove: 0 }}
                      className="d-flex flex-column  justify-content-md-between"
                      onSubmit={(data, { setSubmitting }) => {
                        setSubmitting(true);
                        // send data to the contract

                        setGrantApproval(data);
                        setSubmitting(false);
                      }}
                    >
                      {({
                        values,
                        isSubmitting,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                      }) => (
                        <form onSubmit={handleSubmit}>
                          <div className="row">
                            <Form.Label className="mt-2 mb-2 h4">
                              Approve spending tokens
                            </Form.Label>
                          </div>
                          <div className="row">
                            <div className="col-6">
                              <Form.Control
                                type="text"
                                id="valueToApprove"
                                name="valueToApprove"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="amount of tokens"
                                value={values.valueToApprove}
                              />
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-12">
                              <Button
                                disabled={contractInfo.length === 0}
                                className="mt-2 mb-2 align-self-center col-md-4"
                                variant="primary"
                                type="submit"
                              >
                                Grant Approval to value {values.valueToApprove}
                              </Button>
                            </div>
                          </div>
                        </form>
                      )}
                    </Formik>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        ) : (
          <h2 className="text-center">Wallet not connected</h2>
        )}
      </main>
    </>
    // <Web3Provider
    //   connectors={connectors}
    //   libraryName={"ethers.js" | "web3.js" | null}
    // >
    //   <div className="container">
    //     <h1>Access wallet</h1>
    //   </div>
    // </Web3Provider>
  );
}
