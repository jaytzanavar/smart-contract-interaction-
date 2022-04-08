import "./App.css";
import { ethers } from "ethers";
import BUSD from "./contracts/BUSD.json";
import { useEffect, useState, useRef } from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Overlay from "react-bootstrap/Overlay";
import Tooltip from "react-bootstrap/Tooltip";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";
import ChangeChainModal from "./components/ChangeChainModal/ChangeChainModal.jsx";
import { useFormik, Formik } from "formik";
import { chainNames, chainNetworks } from "./assets/utils";
import Mint from "./components/Mint/Mint";
import Ownership from "./components/Ownership/Ownership";
import { WalletTable } from "./components/WalletTable/WalletTable";

export default function DappWrapper() {
  return <App />;
}

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

// function to get balance
async function getBalance(provider, address) {
  let balance = await provider.getBalance(address);
  return (balance = ethers.utils.formatEther(balance));
}

async function getChainInfo(provider) {
  const chainInfo = await provider.getNetwork();
  return chainInfo;
}

function App() {
  console.log("app starting...");
  // clipboard overlay
  const target = useRef(null);
  const [showClipboard, setShowClipboard] = useState(false);
  const [active, setActive] = useState(null);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contractInfo, setContractInfo] = useState([]);
  const [contractAddr, setContractAddr] = useState([]);
  const [contract, setContract] = useState(null);

  const [transferHash, setTransferHash] = useState(null);
  const [refreshId, setRefreshId] = useState(0);

  // TODO check with metamask ethereum etc
  const { ethereum } = window;

  const [chain, setChain] = useState(() => {
    return {
      chainId: 0,
      ensAddress: "",
      name: "",
      balance: 0,
      currentBlock: "",
    };
  });

  let balanceBigN = async (account) => {
    new ethers.providers.Web3Provider(ethereum).getNetwork().then((chain) => {
      new ethers.providers.Web3Provider(ethereum)
        .getBalance(account)
        .then((bal) => {
          new ethers.providers.Web3Provider(ethereum)
            .getBlockNumber()
            .then((block) => {
              setChain({
                balance: ethers.utils.formatUnits(bal),
                chainId: chain.chainId,
                ensAddress: chain.ensAddress,
                name: chain.name,
                currentBlock: block,
              });
            });
        });
      console.log(chain);
    });
  };

  const requestAccountConnection = () => {
    console.log("Requesting acc...", ethereum);
    if (ethereum) {
      try {
        ethereum.request({ method: "eth_requestAccounts" }).then((res) => {
          accountChangeHandler(res[0]);
          balanceBigN(res[0]);
          setActive(true);
          if (localStorage.getItem("contract") !== null) {
            const setTempContract = localStorage.getItem("contract");
            setContractAddr(setTempContract);
            getContractAndBalanceInfo(setTempContract);
          }
        });
      } catch {}
    } else {
      console.log("Metamask Not detected");
      setActive(false);
    }
  };

  const accountChangeHandler = (newAccount) => {
    setAccount(newAccount);
  };

  const updateEthers = (addr) => {
    let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(tempProvider);

    let tempSigner = tempProvider.getSigner();
    setSigner(tempSigner);

    let tempContract = new ethers.Contract(addr, BUSD.abi, tempSigner);
    setContract(tempContract);
  };

  async function BurnTokens(data) {
    // TODO get balance and block the burn
    await contract.burn(ethers.utils.parseEther(data.amount)).then((res) => {
      const txHash = res.hash;
      console.log(txHash);
      setTransferHash({ burn: txHash });
    });
  }

  // keep user connected
  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      console.log("Use connectWalletOnPageLoad triggered");
      if (localStorage?.getItem("metamask-userConnected") === "true") {
        try {
          await requestAccountConnection();
        } catch (ex) {
          console.log(ex);
        }
      }
    };
    connectWalletOnPageLoad();
  }, []);

  async function disconnectAccount() {
    try {
      setAccount(null);
      setActive(false);
      setContract(null);
      localStorage.removeItem("contract");
      localStorage.removeItem("metamask-userConnected");

      refreshData(true);
    } catch (ex) {
      console.error(ex);
    }
  }

  let erc20Contract;

  // on utilise Mumbai testnet 80001 / 0x15A40d37e6f8A478DdE2cB18c83280D472B2fC35 BUSD token
  async function getContractAndBalanceInfo(erc20Address) {
    console.log(erc20Address);
    console.log(` ${erc20Address} GET CONTRACT AND BALANCE`);
    if (erc20Address) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      erc20Contract = new ethers.Contract(erc20Address, BUSD.abi, provider);

      const tokenName = await erc20Contract.name();
      const tokenSymbol = await erc20Contract.symbol();
      const totalSupply = ethers.utils.formatEther(
        await erc20Contract.totalSupply()
      );

      // await provider;
      const signer = await provider.getSigner(); //jsonRpc
      const signerAddress = await signer.getAddress();

      const balance = ethers.utils.formatEther(
        await erc20Contract.balanceOf(signerAddress)
      );
      const allowance = await erc20Contract.allowance(
        erc20Address,
        signerAddress
      );

      //  const newContractInfos = [...contractInfo];
      const newContractInfos = [];
      setContractInfo(newContractInfos); // for refesh reasons
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
      updateEthers(erc20Address);
    }
  }

  //check allowance of spender
  async function setGrantApproval(data) {
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const getSignerAddr = signer.getAddress();
    const contract = new ethers.Contract(
      contractInfo[0].accountAddress,
      BUSD.abi,
      signer
    );

    const grantApproval = await contract.approve(
      getSignerAddr,
      data.valueToApprove
    );

    // return parseInt(checkAllowance, 10) > 0;
  }

  // addr to send 0x9B678D348821d48D77a586DAbd1B5C394B4cA5f8
  async function sendAmountToAddress(data) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const tx = {
      to: data.recipientAddress,
      value: ethers.utils.parseEther(data.amountOfTransfer),
    };

    signer.sendTransaction(tx).then((res) => {
      setTransferHash({ sendTodAddr: res.hash });
    });
  }

  async function sendTransferFromTo({ from, to, amount }) {
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      contractInfo[0].accountAddress,
      BUSD.abi,
      signer
    );
    let weiAmount = amount === 0 ? 0 : ethers.utils.formatEther(amount);

    console.log(weiAmount);
    try {
      await contract.transferFrom(from, to, weiAmount).then((res) => {
        console.log(res);
        setTransferHash({ sendTransferFrom: res.hash });
      });
    } catch (er) {
      console.error(er);
    }
  }

  const formik = useFormik({
    initialValues: {
      erc20ContractAddress: "",
    },
    onSubmit: async (values) => {
      setContractAddr(values.erc20ContractAddress);
      getContractAndBalanceInfo(values.erc20ContractAddress);
    },
  });

  function autoRefresh() {
    setInterval(() => {
      refreshData();
    }, 60000);
  }
  function refreshData(disconnect = false) {
    if (contractAddr && !disconnect) {
      localStorage.setItem("contract", contractAddr);
      window.location.reload();
    }
  }

  // if (active) {
  //   autoRefresh();
  // }

  return (
    <>
      <header>
        <Navbar className="fixed-refresh-icon" bg="light" expand="lg">
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
                  <>
                    <Button
                      onClick={() => {
                        setShowClipboard(true);
                        navigator.clipboard.writeText(account);
                        setTimeout(() => {
                          setShowClipboard(false);
                        }, 1200);
                      }}
                      className="metamask-btn "
                      variant="outline-secondary"
                      ref={target}
                    >
                      Account {account}
                    </Button>
                    <Overlay
                      key="bottom"
                      placement="bottom"
                      target={target.current}
                      show={showClipboard}
                    >
                      <Tooltip id="tooltip-bottom">
                        Wallet address copied to clipboard
                      </Tooltip>
                    </Overlay>
                  </>
                  <Button
                    onClick={() => {
                      disconnectAccount();
                    }}
                    variant="outline-warning"
                  >
                    Disconnect
                  </Button>
                  <button
                    onClick={() => refreshData()}
                    type="button"
                    className="btn btn-outline-info"
                  >
                    <span className="reload">&#x21bb;</span>
                  </button>
                </div>
              ) : (
                <div>
                  <Button
                    variant="primary"
                    onClick={() => {
                      requestAccountConnection();
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
      <main className="main-screen-position">
        {active ? (
          <div>
            <div className="container">
              <h2 className="text-center">Metamask connected</h2>
            </div>
            <Card className="container mb-4">
              <Card.Body>
                <WalletTable chain={chain} account={account} />
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
            <Card className="container mb-4">
              {
                <Card.Body>
                  <h4>Transfer Token to Account</h4>
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
                                placeholder="@Recipient address"
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
                                disabled={
                                  values.recipientAddress.length === 0 &&
                                  values.amountOfTransfer === 0
                                }
                                className="mt-2 mb-2 align-self-center col-md-4"
                                variant="primary"
                                type="submit"
                              >
                                Send
                              </Button>
                            </div>
                            <div className="col-6 pt-2">
                              <div className="h6">
                                Transaction:{" "}
                                {transferHash !== null ??
                                  transferHash["sendTodAddr"] ??
                                  null}
                              </div>
                            </div>
                          </div>
                        </form>
                      )}
                    </Formik>
                  </div>
                </Card.Body>
              }
            </Card>
            <Card className="container mb-4">
              <Card.Body>
                <h4>Smart Contract interactions</h4>
                {/*START Approve spending Tokens */}
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
                            <div className="col-5">
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
                {/*END Approve spending Tokens */}

                {/*START Transfer from */}
                <div className="container">
                  <div className="row">
                    <Formik
                      initialValues={{ from: "", to: "", amount: 0 }}
                      className="d-flex flex-column  justify-content-md-between"
                      onSubmit={(data, { setSubmitting }) => {
                        setSubmitting(true);
                        // send data to the contract

                        sendTransferFromTo(data);
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
                              Transfer{" "}
                              {contractInfo.length > 0
                                ? contractInfo[0].tokenSymbol
                                : ""}{" "}
                              Tokens From <span>&#8594;</span> To
                            </Form.Label>
                          </div>
                          <div className="row">
                            <div className="col-5">
                              <Form.Control
                                type="text"
                                id="from"
                                name="from"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="@Address From"
                                value={values.from}
                              />
                            </div>
                            <div className="col-5">
                              <Form.Control
                                type="text"
                                id="to"
                                name="to"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="@Address Recipient"
                                value={values.to}
                              />
                            </div>
                            <div className="col-2">
                              <Form.Control
                                type="text"
                                id="amount"
                                name="amount"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Amount of Tokens"
                                value={values.amount}
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
                                Send Tokens
                              </Button>
                            </div>
                            <div className="col-6 pt-2">
                              <div className="h6">
                                Transaction:{" "}
                                {transferHash !== null ??
                                  transferHash["sendTransferFrom"] ??
                                  null}
                              </div>
                            </div>
                          </div>
                        </form>
                      )}
                    </Formik>
                  </div>
                </div>
                {/*END Transfer from*/}

                {/*START Burn  */}
                <div className="container">
                  <div className="row">
                    <Formik
                      initialValues={{ amount: 0 }}
                      className="d-flex flex-column  justify-content-md-between"
                      onSubmit={(data, { setSubmitting }) => {
                        setSubmitting(true);
                        // send data to the contract

                        BurnTokens(data);
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
                              Burn
                              {contractInfo.length > 0
                                ? `  ${contractInfo[0].tokenSymbol}`
                                : ""}{" "}
                              Tokens
                            </Form.Label>
                          </div>
                          <div className="row">
                            <div className="col-5">
                              <Form.Control
                                type="text"
                                id="amount"
                                name="amount"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Token amount to burn"
                                value={values.amount}
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
                                Burn
                              </Button>
                            </div>
                            <div className="col-6 pt-2">
                              <div className="h6">
                                Transaction{" "}
                                {transferHash !== null ??
                                  transferHash["burn"] ??
                                  null}
                              </div>
                            </div>
                          </div>
                        </form>
                      )}
                    </Formik>
                  </div>
                </div>
                {/*END Burn*/}
                {/* START Mint */}
                <Mint
                  provider={provider}
                  contract={contract}
                  contractInfo={contractInfo}
                />
                <Ownership signerAsync={signer} contract={contract} />
              </Card.Body>
            </Card>
          </div>
        ) : (
          <h2 className="text-center">Wallet not connected</h2>
        )}
      </main>
    </>
  );
}
