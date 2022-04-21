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
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Card from "react-bootstrap/Card";
import BUSD from "./contracts/BUSD.json";
import ChangeChainModal from "./components/ChangeChainModal/ChangeChainModal.jsx";
import { useFormik } from "formik";
import { WalletTable } from "./components/WalletTable/WalletTable";
import TransferChainTokenToAccount from "./components/TransferChainTokenToAccount/TransferChainTokenToAccount";
import SmartContractInteractions from "./components/SmartContractInteractions/SmartContractInteractions";
import { ResultToaster } from "./components/ResultToaster/ResultToaster.jsx";
import { BlockchainEvents } from "./components/BlockchainEvents/BlockchainEvents.jsx";
import { BlockchainLiveUpdate } from "./components/BlockchainLiveUpdates/BlockchainLiveUpdate.jsx";
import { EventToaster } from "./components/EventToaster/EventToaster";

export default function DappWrapper() {
  return <App />;
}

function handleChainChange(accounts) {
  if (accounts != null) {
    window.location.reload();
    window.ethereum
      .removeListener("accountsChanged", handleChainChange)
      .setMaxListeners("1");
  }
}

function App() {
  console.log("App has started");
  window.ethereum.on("accountsChanged", handleChainChange);

  // clipboard overlay
  const clipboardTarget = useRef(null);
  const [key, setKey] = useState("interactions");
  const [showClipboard, setShowClipboard] = useState(false);
  const [active, setActive] = useState(null);
  const [account, setAccount] = useState(null);
  const [appSigner, setSigner] = useState("");
  const [provider, setProvider] = useState(null);
  const [contractProps, setContractProps] = useState({ contractInfo: [] });
  const [contractInfo, setContractInfo] = useState([]);
  const [contractAddr, setContractAddr] = useState("");
  const [networkInfo, setNetworkInfo] = useState({
    name: "",
    chainId: "",
  });

  const [liveEvent, setLiveEvent] = useState({
    id: 0,
    data: null,
    signerContract: false,
  });

  const [toastData, setToasterData] = useState({
    show: false,
    result: "",
    variant: "",
  });
  const [eventToastData, setEventToaster] = useState({
    show: false,
    result: null,
    variant: "",
  });

  // TODO check with metamask ethereum etc
  const { ethereum } = window;

  // useEffect(() => {
  //   let wsProvider;
  //   let wsContract;
  //   let generalfilterContract;
  //   console.log("APP SIGNER CHANGED", appSigner);
  //   console.log("Event toast changed", eventToastData);
  //   const openBlockWsProvider = async (ethers, abi, signer) => {
  //     const iface = new ethers.utils.Interface(BUSD.abi);
  //     const contractAddress = localStorage?.getItem("contract");

  //     if (ethers && contractAddress) {
  //       wsProvider = new ethers.providers.WebSocketProvider(
  //         "wss://rpc-mumbai.maticvigil.com/ws/v1/24fd79d31c2188c409ab1b82407fbe0bcba657bd"
  //       );

  //       // sets the network stuff !
  //       console.log("signer 2", appSigner);
  //       wsProvider._networkPromise.then((res) => {
  //         setNetworkInfo({
  //           name: res.name,
  //           chainId: res.chainId,
  //         });
  //       });
  //       wsContract = new ethers.Contract(contractAddress, abi, wsProvider);

  //       generalfilterContract = {
  //         topics: [
  //           [
  //             ethers.utils.id("Approval(address,address,uint256)"),
  //             ethers.utils.id("Transfer(address,address,uint256)"),
  //           ],
  //         ],
  //       };

  //       console.log("pre -signer 3", { appSigner, signer });
  //       wsContract.on(generalfilterContract, (log) => {
  //         const data = log.data;
  //         const topics = log.topics;
  //         const logDescription = iface.parseLog({ data, topics });
  //         const logDescriptionFormat = JSON.parse(
  //           JSON.stringify(logDescription)
  //         );
  //         console.log("WEB SOCKET RECEIVE DATA", logDescriptionFormat);
  //         console.log("WEB SOCKET RECEIVE DATA", logDescriptionFormat.args);

  //         console.log("signer", logDescriptionFormat.args.includes(appSigner));
  //         if (logDescriptionFormat.args.includes(appSigner)) {
  //           console.log("RETURN OURS");
  //           setEventToaster({
  //             show: true,
  //             result: logDescriptionFormat,
  //             variant: "Primary",
  //           });
  //           setTimeout(() => {
  //             setEventToaster({
  //               show: false,

  //             });
  //           }, 4500);
  //           setLiveEvent({
  //             data: logDescriptionFormat,
  //             signerContract: true,
  //           });
  //         } else {
  //           console.log("RETURN OTHERS");

  //           setEventToaster({
  //             show: true,
  //             result: logDescriptionFormat,
  //             variant: "Secondary",
  //           });
  //           setTimeout(() => {
  //             setEventToaster({
  //               show: false,
  //               ...eventToastData,
  //             });
  //           }, 2500);
  //           setLiveEvent({
  //             data: logDescriptionFormat,
  //             signerContract: false,
  //           });
  //         }
  //       });
  //     }
  //   };

  //   if (!!ethers) {
  //     openBlockWsProvider(ethers, BUSD.abi, appSigner);
  //   }

  //   return () => {
  //     wsContract.off(generalfilterContract);
  //   };
  // }, [appSigner, eventToastData]);

  useEffect(() => {
    let wsProvider;
    let wsContract;
    let generalfilterContract;
    const openBlockWsProvider = async (ethers, abi, signer) => {
      const iface = new ethers.utils.Interface(BUSD.abi);
      const contractAddress = localStorage?.getItem("contract");

      if (ethers && contractAddress) {
        wsProvider = new ethers.providers.WebSocketProvider(
          "wss://rpc-mumbai.maticvigil.com/ws/v1/24fd79d31c2188c409ab1b82407fbe0bcba657bd"
        );

        // sets the network stuff !
        console.log("signer 2", appSigner);
        wsProvider._networkPromise.then((res) => {
          setNetworkInfo({
            name: res.name,
            chainId: res.chainId,
          });
        });
        wsContract = new ethers.Contract(contractAddress, abi, wsProvider);

        generalfilterContract = {
          topics: [
            [
              ethers.utils.id("Approval(address,address,uint256)"),
              ethers.utils.id("Transfer(address,address,uint256)"),
            ],
          ],
        };

        console.log("pre -signer 3", { appSigner, signer });
        wsContract.on(generalfilterContract, (log) => {
          const data = log.data;
          const topics = log.topics;
          const logDescription = iface.parseLog({ data, topics });
          const logDescriptionFormat = JSON.parse(
            JSON.stringify(logDescription)
          );
          console.log("WEB SOCKET RECEIVE DATA", logDescriptionFormat);
          console.log("WEB SOCKET RECEIVE DATA", logDescriptionFormat.args);

          console.log("signer", logDescriptionFormat.args.includes(appSigner));
          if (logDescriptionFormat.args.includes(appSigner)) {
            console.log("RETURN OURS");
            setEventToaster({
              show: true,
              result: logDescriptionFormat,
              variant: "Primary",
            });
            setTimeout(() => {
              setEventToaster({
                show: false,
              });
            }, 4500);

            setLiveEvent({
              data: logDescriptionFormat,
              signerContract: true,
            });
          } else {
            console.log("RETURN OTHERS");

            setEventToaster({
              show: true,
              result: logDescriptionFormat,
              variant: "Secondary",
            });
            setTimeout(() => {
              setEventToaster({
                show: false,
                ...eventToastData,
              });
            }, 2500);
            setLiveEvent({
              data: logDescriptionFormat,
              signerContract: false,
            });
          }
        });
      }
    };

    if (!!ethers && appSigner !== "") {
      openBlockWsProvider(ethers, BUSD.abi, appSigner);
    }

    return () => {
      if (!!generalfilterContract) wsContract.off(generalfilterContract);
    };
  }, [appSigner, active, eventToastData]);

  // keep user connectedF
  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      console.log("connectWallet on page load");
      if (localStorage?.getItem("metamask-userConnected") === "true") {
        try {
          if (ethereum) {
            try {
              await ethereum.request({ method: "eth_requestAccounts" }).then(
                async (res) => {
                  accountChangeHandler(res[0]);
                  setAccount(res[0]);
                  setActive(true);
                  if (localStorage.getItem("contract") !== null) {
                    const tempProvider = new ethers.providers.Web3Provider(
                      window.ethereum
                    );
                    setProvider(tempProvider);
                    const tempSigner = await tempProvider.getSigner();
                    const tempSignerAddress = await tempSigner.getAddress();
                    if (appSigner !== tempSignerAddress) {
                      setSigner(tempSignerAddress);
                    }

                    const setTempContractAddress =
                      localStorage.getItem("contract");
                    let tempContract = new ethers.Contract(
                      setTempContractAddress,
                      BUSD.abi,
                      tempSigner
                    );
                    const tokenName = await tempContract.name();
                    const tokenSymbol = await tempContract.symbol();
                    const totalSupply = ethers.utils.formatEther(
                      await tempContract.totalSupply()
                    );

                    const balance = ethers.utils.formatEther(
                      await tempContract.balanceOf(tempSignerAddress)
                    );

                    const newContractInfos = [];
                    newContractInfos.push({
                      contractAddress: setTempContractAddress,
                      tokenName,
                      tokenSymbol,
                      totalSupply: totalSupply,
                      accountAddress: tempSigner,
                      balance: balance,
                    });

                    setContractInfo(newContractInfos);
                    setContractProps({
                      provider: tempProvider,
                      ethers: ethers,
                      contractInfo: newContractInfos,
                      contract: tempContract,
                      signer: tempSigner,
                    });
                  }
                },
                (error) => {
                  console.error(` In  request account ${error}`);
                }
              );
            } catch (err) {
              console.error("Request account error", err);
            }
          } else {
            console.error("Metamask Not detected");
            setActive(false);
          }
        } catch (ex) {
          console.error(ex);
        }
      }
    };

    connectWalletOnPageLoad();
    // return () => {
    //   console.log("unmounting main app");
    //   if (!!ws) {
    //     ws.provider._websocket.close();
    //     ws.contract.off("*", (args) => {
    //       console.log("unsubscribed from contract", args);
    //     });
    //     console.log("terminating ws...");
    //   }
    // };
  }, [ethereum, appSigner]);

  useEffect(() => {
    if (active) {
      let autoRefreshInterval;

      if (!!localStorage?.getItem("contract")) {
        // autoRefreshInterval = setInterval(async () => {
        //   window.location.reload();
        // }, 60000);
      }
      return () => {
        clearInterval(autoRefreshInterval);
      };
    }
  }, [active]);

  const refreshData = (disconnect = false) => {
    if (localStorage?.getItem("contract") !== undefined) {
      getContractAndBalanceInfo(localStorage?.getItem("contract"));
      window.location.reload();
    } else {
      if (disconnect && (contractAddr.length === 0 || contractAddr === null)) {
        setToasterData({
          show: true,
          result: "Missing connection with contract",
          variant: "Warning",
        });
        setContractInfo([]);
        setTimeout(() => {
          setToasterData({
            show: false,
            ...toastData,
          });
        }, 2500);
      }
    }
  };

  const accountChangeHandler = (newAccount) => {
    setAccount(newAccount);
  };

  const requestAccountConnection = async () => {
    if (ethereum) {
      try {
        await ethereum.request({ method: "eth_requestAccounts" }).then(
          (res) => {
            accountChangeHandler(res[0]);
            setActive(true);
            if (localStorage.getItem("contract") !== null) {
              const setTempContract = localStorage.getItem("contract");
              getContractAndBalanceInfo(setTempContract);
            }
          },
          (error) => {
            console.error(` In  request account ${error}`);
          }
        );
      } catch (err) {
        console.error("Request account error", err);
      }
    } else {
      console.error("Metamask Not detected");
      setActive(false);
    }
  };

  // Disconnect account
  async function disconnectAccount() {
    try {
      setAccount(null);
      setActive(false);
      setContractProps({});
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
      localStorage.setItem("contract", erc20Address);
      let tempProvider = provider;
      let tempContract;

      if (provider === null) {
        tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      } // saves local storage
      await tempProvider.send("eth_requestAccounts", []);
      setProvider(tempProvider);

      const tempSigner = await tempProvider.getSigner(); //jsonRpc
      const signerAddress = await tempSigner.getAddress();

      try {
        tempContract = new ethers.Contract(erc20Address, BUSD.abi, tempSigner);
      } catch (err) {
        console.error("errror in getting contract", err);
      }
      const tokenName = await tempContract.name();
      const tokenSymbol = await tempContract.symbol();
      const totalSupply = ethers.utils.formatEther(
        await tempContract.totalSupply()
      );
      const balance = ethers.utils.formatEther(
        await tempContract.balanceOf(signerAddress)
      );

      const newContractInfos = [];
      newContractInfos.push({
        contractAddress: erc20Address,
        tokenName,
        tokenSymbol,
        totalSupply: totalSupply,
        accountAddress: signerAddress,
        balance: balance,
      });
      setContractInfo(newContractInfos);
      setContractProps({
        provider: tempProvider,
        ethers: ethers,
        contractInfo: newContractInfos,
        contract: tempContract,
        signer: tempSigner,
      });
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

  return (
    <>
      <header>
        <Navbar className="fixed-refresh-icon" bg="light" expand="lg">
          <Container>
            <Navbar.Brand>
              <div className="d-flex">
                {!!ethers ? (
                  <BlockchainLiveUpdate
                    event={liveEvent}
                    networkInfo={networkInfo}
                    ethers={ethers}
                  />
                ) : null}
                <div
                  style={{ marginLeft: 10 }}
                  className="d-flex flex-collumn align-items-center"
                >
                  Smart Contract App
                </div>
              </div>
            </Navbar.Brand>
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
                      className="metamask-btn"
                      variant="outline-secondary"
                      ref={clipboardTarget}
                    >
                      Account {account}
                    </Button>
                    <Overlay
                      key="bottom"
                      placement="bottom"
                      clipboardTarget={clipboardTarget.current}
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
            <Card className="container mb-4">
              <Card.Body>
                <WalletTable ethers={ethers} account={account} />
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
                <h4> Contract Info </h4>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Contract address</th>
                      <th>Total Balance of Account</th>
                      <th>Token</th>
                      <th>Total Supply</th>
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
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td>0</td>
                        <td>#</td>
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
              <Card.Body>
                <Tabs
                  id="controlled-tab-example"
                  activeKey={key}
                  onSelect={(k) => setKey(k)}
                  className="mb-3"
                  defaultActiveKey="interactions"
                >
                  <Tab
                    eventKey="interactions"
                    title="Smart Contract Interactions"
                  >
                    <SmartContractInteractions
                      contractProps={contractProps}
                      refresh={refreshData}
                    />
                  </Tab>
                  <Tab eventKey="blockchainEvents" title="Blockchain Events">
                    <BlockchainEvents contractProps={contractProps} />
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </div>
        ) : (
          <h2 className="text-center">Wallet not connected</h2>
        )}
        {eventToastData.result !== null ? (
          <EventToaster
            result={eventToastData.result}
            show={eventToastData.show}
            variant={eventToastData.variant}
            setData={setEventToaster}
            ethers={ethers}
          />
        ) : null}

        <ResultToaster
          result={toastData.result}
          show={toastData.show}
          variant={toastData.variant}
          setData={setToasterData}
        />
      </main>
    </>
  );
}
