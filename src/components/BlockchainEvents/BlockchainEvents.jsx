import { useEffect, useState } from "react";
import { ResultToaster } from "../ResultToaster/ResultToaster";
import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import "./BlockchainEvents.css";

export function BlockchainEvents({ contractProps }) {
  console.log("Blockchain events has started...");
  const [contractApprovedEvents, setContractApprovedEvents] = useState([]);
  const [blockTimeStamp, seBlockTimeStamp] = useState([{}]);
  const [contractApprovedEventsLoading, setLoadingContractApprovedEvents] =
    useState(false);
  const [usersContractApprovedEvents, setUsersContractApprovedEvents] =
    useState([]);
  const [
    usersContractApprovedEventsLoading,
    setLoadingUsersContractApprovedEvents,
  ] = useState(false);
  const [userOverallAllowance, setUserOverallAllowance] = useState([]);
  const [userOverallAllowanceLoading, setLoadingUserOverallAllowance] =
    useState(false);
  const [latestBlockNumber, setLatestBlockNumber] = useState(0);
  const [currentSigner, setCurrentSigner] = useState("");
  const [contractSymbol, setContractSymbol] = useState("");
  const [contractAddr, setContractAddr] = useState("");
  const [toastData, setToasterData] = useState({
    show: false,
    result: "",
    variant: "",
  });

  let contractBUSCreatedBlock = 22069112; // hardcoded

  let { provider, ethers, contractInfo, contract, signer } = contractProps;

  useEffect(() => {
    if (!!provider) {
      provider.getBlockNumber().then((res) => {
        setLatestBlockNumber(res);
      });
    }
  }, [provider]);

  useEffect(() => {
    if (!!signer) {
      signer.getAddress().then((res) => {
        setCurrentSigner(res);
      });
    }
  }, [signer]);

  useEffect(() => {
    if (!!contract) {
      contract.symbol().then((res) => {
        setContractSymbol(res);
      });
      setContractAddr(contract.address);
    }
  }, [contract]);

  const investigateTransferApproveBlockchain = async () => {
    if (
      !!contract &&
      !!signer &&
      !!provider &&
      contractInfo.length > 0 &&
      latestBlockNumber !== 0
    ) {
      const approveFilters = contract.filters.Approval();
      const transferFilters = contract.filters.Transfer();
      let lastBlockToCheck = latestBlockNumber;
      let endBlock = lastBlockToCheck;
      let allApproveEvents = [];

      for (let i = 0; i < lastBlockToCheck; i += 1000) {
        const _endBlock = endBlock - i; //Math.min(endBlock, i + 1000);
        const _startBlock = endBlock - (i + 1000);
        const approvedE = await contract.queryFilter(
          approveFilters,
          _startBlock,
          _endBlock
        );
        const transferE = await contract.queryFilter(
          transferFilters,
          _startBlock,
          _endBlock
        );
        allApproveEvents = [...allApproveEvents, ...approvedE, ...transferE];
        if (allApproveEvents.length >= 10) break;
      }

      if (allApproveEvents.length > 10) {
        allApproveEvents = allApproveEvents.slice(0, 10);
        if (allApproveEvents.length === 10) {
          return allApproveEvents;
        }
      }
      return allApproveEvents;
    }
  };

  const investigateUsersTransferApproveBlockchain = async () => {
    if (
      !!contract &&
      !!signer &&
      !!provider &&
      contractInfo.length > 0 &&
      latestBlockNumber !== 0
    ) {
      const approveFilters = contract.filters.Approval(currentSigner);
      const transferFilters = contract.filters.Transfer(currentSigner);
      let lastBlockToCheck = latestBlockNumber;
      let endBlock = lastBlockToCheck;
      let allApproveEvents = [];

      for (let i = 0; i < lastBlockToCheck; i += 1000) {
        const _endBlock = endBlock - i; //Math.min(endBlock, i + 1000);
        const _startBlock = endBlock - (i + 1000);
        const approvedE = await contract.queryFilter(
          approveFilters,
          _startBlock,
          _endBlock
        );
        const transferE = await contract.queryFilter(
          transferFilters,
          _startBlock,
          _endBlock
        );
        allApproveEvents = [...allApproveEvents, ...approvedE, ...transferE];
        if (allApproveEvents.length >= 10) break;
      }

      if (allApproveEvents.length > 10) {
        allApproveEvents = allApproveEvents.slice(0, 10);
        if (allApproveEvents.length === 10) {
          return allApproveEvents;
        }
      }
      return allApproveEvents;
    }
  };

  const investigateAllTokenAllowance = async () => {
    if (
      !!contract &&
      !!signer &&
      !!provider &&
      contractInfo.length > 0 &&
      latestBlockNumber !== 0
    ) {
      const approveFilters = contract.filters.Approval(currentSigner);
      let lastBlockToCheck = latestBlockNumber;
      let allApproveEvents = [];
      for (let i = lastBlockToCheck; i >= contractBUSCreatedBlock; i -= 1000) {
        const _startBlock = i - 1000;
        const _endBlock = i;
        const approvedE = await contract.queryFilter(
          approveFilters,
          _startBlock,
          _endBlock
        );

        if (approvedE.length > 0)
          allApproveEvents = [...allApproveEvents, ...approvedE];

        if (allApproveEvents.length >= 15) break;
      }
      return allApproveEvents;
    }
  };

  function queryInvestigateTransferApproveBlockchain() {
    setLoadingContractApprovedEvents(true);
    investigateTransferApproveBlockchain().then((res) => {
      if (!!res) {
        if (res.length > 0) {
          if (contractApprovedEvents.length < 10) {
            const tempArray = [...contractApprovedEvents, ...res];
            let bn = tempArray.map((x) => x.blockNumber);
            bn.forEach((x) => getDateFromBlockNumber(x));
            setContractApprovedEvents(tempArray);
            setLoadingContractApprovedEvents(false);
          }
        }
      }
    });
  }
  function queryInvestigateUsersTransferApproveBlockchain() {
    setLoadingUsersContractApprovedEvents(true);
    investigateUsersTransferApproveBlockchain().then((res) => {
      if (!!res) {
        if (res.length > 0) {
          if (contractApprovedEvents.length < 10) {
            const tempArray = [...contractApprovedEvents, ...res];
            setUsersContractApprovedEvents(tempArray);
            setLoadingUsersContractApprovedEvents(false);
          }
        }
      }
    });
  }

  function queryInvestiagetUserOverallAllowance() {
    setLoadingUserOverallAllowance(true);
    investigateAllTokenAllowance().then((res) => {
      if (!!res) {
        if (res.length > 0) {
          if (contractApprovedEvents.length < 13) {
            const tempArray = [...contractApprovedEvents, ...res];
            setUserOverallAllowance(tempArray);
            setLoadingUserOverallAllowance(false);
          }
        }
      }
    });
  }

  const getDateFromBlockNumber = async (blocknum) => {
    console.log(blocknum);
    let timestamp = await provider.getBlock(blocknum);
    console.log(timestamp);
    seBlockTimeStamp([
      ...blockTimeStamp,
      { blocknum: blocknum, timest: timestamp },
    ]);
    console.log(blockTimeStamp);
  };

  return (
    <>
      {contract ? (
        <>
          {" "}
          <h4>Contract's {contractAddr} Filter Events</h4>
          <div className="container mt-5">
            <div className="row">
              <div className="row">
                <h6 className="col-6">
                  Blockchain Approve &#x26; Transfer Events
                </h6>
                <div className="col-6">
                  <div className="row">
                    <div
                      style={{
                        visibility: contractApprovedEventsLoading
                          ? "visible"
                          : "hidden",
                      }}
                      className="offset-3 col-3 d-flex"
                    >
                      <div style={{ marginRight: 10 }}>Querying...</div>
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </div>
                    <button
                      onClick={() =>
                        queryInvestigateTransferApproveBlockchain()
                      }
                      className="btn btn-primary col-6"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
              <Card>
                <Card.Body className="table-overflow ">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>#</th>

                        <th>Block Hash</th>
                        <th>Block Number</th>
                        <th>Date</th>
                        <th>Owner</th>
                        <th>Spender</th>
                        <th>Value</th>
                        <th>EventSignature</th>
                        <th>LogIndex</th>
                        <th>Removed</th>
                        <th>TransactionHash</th>
                        <th>TransactionIndex</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contractApprovedEvents.length > 0 ? (
                        contractApprovedEvents.map((event, index) => (
                          <tr key={event.blockHash + index}>
                            <td>{index}</td>

                            <td>{event.blockHash}</td>
                            <td>{event.blockNumber}</td>
                            <td>
                              {
                                blockTimeStamp.filter(
                                  (x) => x.blockNumber === event.blockNumber
                                )[0]?.timest
                              }
                            </td>
                            <td>{event.args[0]}</td>
                            <td>{event.args[1]}</td>
                            <td>
                              {ethers.utils.formatEther(event.args[2])}
                              {contractSymbol}
                            </td>
                            <td>{event.eventSignature}</td>
                            <td>{event.logIndex}</td>
                            <td>{event.removed}</td>
                            <td>{event.transactionHash}</td>
                            <td>{event.transactionIndex}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td>no</td>

                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
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
            </div>
            <div className="row mt-3">
              <div className="row">
                <h6 className="col-6">
                  {" "}
                  User's (
                  {currentSigner.length > 20
                    ? currentSigner.substr(0, 19) + "..."
                    : currentSigner}
                  ) Events Approve &#x26; Transfer
                </h6>
                <div className="col-6">
                  <div className="row">
                    <div
                      style={{
                        visibility: usersContractApprovedEventsLoading
                          ? "visible"
                          : "hidden",
                      }}
                      className="offset-3 col-3 d-flex"
                    >
                      <div style={{ marginRight: 10 }}>Querying...</div>
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </div>
                    <button
                      onClick={() =>
                        queryInvestigateUsersTransferApproveBlockchain()
                      }
                      className="btn btn-primary col-6"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
              <Card>
                <Card.Body className="table-overflow ">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>#</th>

                        <th>BlockHash</th>
                        <th>BlockNumber</th>
                        <th>Owner</th>
                        <th>Spender</th>
                        <th>Value</th>
                        <th>EventSignature</th>
                        <th>LogIndex</th>
                        <th>Removed</th>
                        <th>TransactionHash</th>
                        <th>TransactionIndex</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* {event.args[3]} */}
                      {usersContractApprovedEvents.length > 0 ? (
                        usersContractApprovedEvents.map((event, index) => (
                          <tr key={event.blockHash + index}>
                            <td>{index}</td>

                            <td>{event.blockHash}</td>
                            <td>{event.blockNumber}</td>
                            <td>{event.args[0]}</td>
                            <td>{event.args[1]}</td>
                            <td>
                              {ethers.utils.formatEther(event.args[2])}
                              {contractSymbol}
                            </td>
                            <td>{event.eventSignature}</td>
                            <td>{event.logIndex}</td>
                            <td>{event.removed}</td>
                            <td>{event.transactionHash}</td>
                            <td>{event.transactionIndex}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td>no</td>

                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
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
            </div>
            <div className="row mt-3">
              <div className="row">
                <h6 className="col-6"> User's overal allowance</h6>
                <div className="col-6">
                  <div className="row">
                    <div
                      style={{
                        visibility: userOverallAllowanceLoading
                          ? "visible"
                          : "hidden",
                      }}
                      className="offset-3 col-3 d-flex"
                    >
                      <div style={{ marginRight: 10 }}>Querying...</div>
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </div>
                    <button
                      onClick={() => queryInvestiagetUserOverallAllowance()}
                      className="col-6 btn btn-primary"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>

              <Card>
                <Card.Body className="table-overflow ">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>#</th>

                        <th>BlockHash</th>
                        <th>BlockNumber</th>
                        <th>Owner</th>
                        <th>Spender</th>
                        <th>Value</th>
                        <th>EventSignature</th>
                        <th>LogIndex</th>
                        <th>Removed</th>
                        <th>TransactionHash</th>
                        <th>TransactionIndex</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* {event.args[3]} */}
                      {userOverallAllowance.length > 0 ? (
                        userOverallAllowance.map((event, index) => (
                          <tr key={event.blockHash + index}>
                            <td>{index}</td>

                            <td>{event.blockHash}</td>
                            <td>{event.blockNumber}</td>
                            <td>{event.args[0]}</td>
                            <td>{event.args[1]}</td>
                            <td>
                              {ethers.utils.formatEther(event.args[2])}
                              {contractSymbol}
                            </td>
                            <td>{event.eventSignature}</td>
                            <td>{event.logIndex}</td>
                            <td>{event.removed}</td>
                            <td>{event.transactionHash}</td>
                            <td>{event.transactionIndex}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td>no</td>

                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
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
            </div>
          </div>
        </>
      ) : (
        <h4>
          Please query the ERC20 contract you want to interact in the{" "}
          <i>Insert contract address form</i>
        </h4>
      )}

      <ResultToaster
        result={toastData.result}
        show={toastData.show}
        variant={toastData.variant}
        setData={setToasterData}
      />
    </>
  );
}
