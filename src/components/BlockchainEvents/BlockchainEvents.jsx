import { useEffect, useState } from "react";
import { ResultToaster } from "../ResultToaster/ResultToaster";
import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";
import "./BlockchainEvents.css";

export function BlockchainEvents({ contractProps }) {
  console.log("Blockchain events has started...");
  const [contractApprovedEvents, setContractApprovedEvents] = useState([]);
  const [usersContractApprovedEvents, setUsersContractApprovedEvents] =
    useState([]);
  const [latestBlockNumber, setLatestBlockNumber] = useState(0);
  const [currentSigner, setCurrentSigner] = useState("");
  const [contractSymbol, setContractSymbol] = useState("");
  const [contractAddr, setContractAddr] = useState("");
  const [toastData, setToasterData] = useState({
    show: false,
    result: "",
    variant: "",
  });

  let { provider, ethers, contractInfo, contract, signer } = contractProps;
  console.log(contractInfo);
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
      let endBlock = lastBlockToCheck;
      let allApproveEvents = [];

      for (let i = 0; i < lastBlockToCheck; i += 1000) {
        const _endBlock = endBlock - i; //Math.min(endBlock, i + 1000);
        const _startBlock = endBlock - (i + 1000);
        console.log({ _startBlock, _endBlock });
        const approvedE = await contract.queryFilter(
          approveFilters,
          _startBlock,
          _endBlock
        );

        console.log("Allo*****************", approvedE);
        allApproveEvents = [...allApproveEvents, ...approvedE];
        if (allApproveEvents.length >= 20) break;
      }

      if (allApproveEvents.length > 20) {
        allApproveEvents = allApproveEvents.slice(0, 20);
        if (allApproveEvents.length === 20) {
          return allApproveEvents;
        }
      }
      return allApproveEvents;
    }
  };

  investigateTransferApproveBlockchain().then((res) => {
    if (!!res) {
      if (res.length > 0) {
        if (contractApprovedEvents.length < 10) {
          const tempArray = [...contractApprovedEvents, ...res];
          setContractApprovedEvents(tempArray);
        }
      }
    }
  });

  investigateUsersTransferApproveBlockchain().then((res) => {
    if (!!res) {
      if (res.length > 0) {
        if (contractApprovedEvents.length < 10) {
          const tempArray = [...contractApprovedEvents, ...res];
          setUsersContractApprovedEvents(tempArray);
        }
      }
    }
  });

  investigateAllTokenAllowance().then((res) => {
    if (!!res) {
      if (res.length > 0) {
        console.log(" allowance array", res);
        if (contractApprovedEvents.length < 20) {
          const tempArray = [...contractApprovedEvents, ...res];
          setUsersContractApprovedEvents(tempArray);
        }
      }
    }
  });

  return (
    <>
      <h4>Contract's {contractAddr} Filter Events</h4>
      <div className="container mt-5">
        <div className="row">
          <h6>Blockchain Approve &#x26; Transfer Events</h6>
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
                  {contractApprovedEvents.length > 0 ? (
                    contractApprovedEvents.map((event, index) => (
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
          <h6> User's ({currentSigner}) Events Approve &#x26; Transfer</h6>
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
      </div>
      <ResultToaster
        result={toastData.result}
        show={toastData.show}
        variant={toastData.variant}
        setData={setToasterData}
      />
    </>
  );
}
