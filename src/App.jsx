import "./App.css";
import { ethers } from "ethers";
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
import BUSD from "./contracts/BUSD.json";
import ChangeChainModal from "./components/ChangeChainModal/ChangeChainModal.jsx";
import { useFormik } from "formik";
import { chainNetworks } from "./assets/utils";
import { WalletTable } from "./components/WalletTable/WalletTable";
import TransferChainTokenToAccount from "./components/TransferChainTokenToAccount/TransferChainTokenToAccount";
import SmartContractInteractions from "./components/SmartContractInteractions/SmartContractInteractions";

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

  // TODO check with metamask ethereum etc
  const { ethereum } = window;

  const requestAccountConnection = async () => {
    console.log("Requesting acc...", ethereum);
    if (ethereum) {
      try {
        await ethereum
          .request({ method: "eth_requestAccounts" })
          .then((res) => {
            accountChangeHandler(res[0]);
            setActive(true);
            if (localStorage.getItem("contract") !== null) {
              const setTempContract = localStorage.getItem("contract");

              setContractAddr(setTempContract);
              getContractAndBalanceInfo(setTempContract);
            }
          });
      } catch {}
    } else {
      console.error("Metamask Not detected");
      setActive(false);
    }
  };

  const accountChangeHandler = (newAccount) => {
    setAccount(newAccount);
  };

  const updateEthers = async (addr) => {
    let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(tempProvider);

    let tempSigner = tempProvider.getSigner();

    setSigner(tempSigner);

    let tempContract = await new ethers.Contract(addr, BUSD.abi, tempSigner);
    let contractAddress = tempContract.address;
    setContract(tempContract);
    setContractAddr(contractAddress);
  };

  // keep user connected
  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      if (localStorage?.getItem("metamask-userConnected") === "true") {
        try {
          await requestAccountConnection();
        } catch (ex) {
          console.error(ex);
        }
      }

      if (!!localStorage?.getItem("contract")) {
        autoRefresh();
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

  // on utilise Mumbai testnet 80001 / 0x15A40d37e6f8A478DdE2cB18c83280D472B2fC35 BUSD token
  async function getContractAndBalanceInfo(erc20Address) {
    if (erc20Address) {
      localStorage.setItem("contract", erc20Address); // saves local storage
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      await tempProvider.send("eth_requestAccounts", []);
      let tempContract = new ethers.Contract(
        erc20Address,
        BUSD.abi,
        tempProvider
      );
      setContract(tempContract);

      const tokenName = await tempContract.name();
      const tokenSymbol = await tempContract.symbol();
      const totalSupply = ethers.utils.formatEther(
        await tempContract.totalSupply()
      );

      // await provider;
      const signer = await tempProvider.getSigner(); //jsonRpc
      const signerAddress = await signer.getAddress();

      const balance = ethers.utils.formatEther(
        await tempContract.balanceOf(signerAddress)
      );
      const allowance = await tempContract.allowance(
        erc20Address,
        signerAddress
      );

      //  const newContractInfos = [...contractInfo];
      const newContractInfos = [];
      setContractInfo(newContractInfos); // for refesh reasons

      newContractInfos.push({
        contractAddress: erc20Address,
        tokenName,
        tokenSymbol,
        totalSupply: totalSupply,
        accountAddress: signerAddress,
        balance: balance,
        allowance: ethers.utils.formatEther(allowance) > 0,
      });

      setContractInfo(newContractInfos);
      updateEthers(erc20Address);
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
      window.location.reload();
    }
  }

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
                    disabled={!contractAddr}
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
                <WalletTable ethers={ethers} account={account} />
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
                  <TransferChainTokenToAccount
                    ethers={ethers}
                    utils={ethers.utils}
                  />
                </Card.Body>
              }
            </Card>
            <Card className="container mb-4">
              <Card.Body>
                <SmartContractInteractions
                  provider={provider}
                  ethers={ethers}
                  contractInfo={contractInfo}
                  singer={signer}
                  contract={contract}
                />
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
