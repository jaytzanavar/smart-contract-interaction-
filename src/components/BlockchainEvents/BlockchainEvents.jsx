import { useState } from "react";
import { ResultToaster } from "../ResultToaster/ResultToaster";
import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";

export function BlockchainEvents({ contractProps }) {
  const [toastData, setToasterData] = useState({
    show: false,
    result: "",
    variant: "",
  });
  const [contractApprovedEvents, setContractApprovedEvents] = useState([]);

  let { provider, ethers, contractInfo, contract, signer } = contractProps;

  const investigateContract = async () => {
    if (contract) {
      const signerAddr = await signer.getAddress();
      const contractInstance = await contract.connect(signer);
      const viewContractsSendFromMyAddress =
        contract.filters.Transfer(signerAddr);

      const approveFilters = contract.filters.Approval();
      const contractAddr = await contract.address;
      console.log(contractAddr);
      const getLatestBlock = await provider.getBlockNumber();
      console.log(getLatestBlock);
      let approveArray = [];
      let lastBlockToCheck = getLatestBlock;
      while (approveArray.length < 10) {
        const events = await contract.queryFilter(
          approveFilters,
          lastBlockToCheck - 999,
          lastBlockToCheck
        );
        lastBlockToCheck = lastBlockToCheck - 999;
        if (events.length > 0) {
          approveArray = [...approveArray, ...events];
        }
        console.log("=======================>>>");
        console.log(events);
        console.log(approveArray);
      }
      setContractApprovedEvents(approveArray); // SUPER LOOP CHECK out for useEffect

      //   const approvalLogs = await provider.getLogs("Approval");
      //   let getBUSDcontract = approvalLogs;
      //  console.log(getBUSDcontract);
      //const provider.resetEventsBlock()
    }
  };
  investigateContract();
  console.log("blockchain events", contractProps);
  return (
    <>
      <h4>Contract &#x26; User Events</h4>
      <div className="container mt-5">
        <div className="row">
          <Card>
            <Card.Body>
              {/* address: "0x15A40d37e6f8A478DdE2cB18c83280D472B2fC35"
args: (3) ['0xFe5a44605eEd83DAe7e2CA1A83F84Ed61Ce38DCD', '0xeBd7E1Ef7c7D1571cE4b8dE72F97ED1D7e01E713', BigNumber, owner: '0xFe5a44605eEd83DAe7e2CA1A83F84Ed61Ce38DCD', spender: '0xeBd7E1Ef7c7D1571cE4b8dE72F97ED1D7e01E713', value: BigNumber]
blockHash: "0xfd4fb9489dd7d5976f65d233e00a6a704874448ed25de175b7166e5c1f402b4f"
blockNumber: 25890166
data: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
event: "Approval"
eventSignature: "Approval(address,address,uint256)"
getBlock: () => {…}
getTransaction: () => {…}
getTransactionReceipt: () => {…}
logIndex: 120
removeListener: () => {…}
removed: false
topics: (3) ['0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925', '0x000000000000000000000000fe5a44605eed83dae7e2ca1a83f84ed61ce38dcd', '0x000000000000000000000000ebd7e1ef7c7d1571ce4b8de72f97ed1d7e01e713']
transactionHash: "0x4698ff091c10fcbfbc1cb8c3b1460f0aab8d4710550e72e80e417d2a76529a0c"
transactionIndex: 31 */}
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Contract address</th>
                    <th>BlockHash</th>
                    <th>BlockNumber</th>
                    <th>Data</th>
                    <th>EventSignature</th>
                    <th>LogIndex</th>
                    <th>Removed</th>
                    <th>TransactionHash</th>
                    <th>TransactionIndex</th>
                  </tr>
                </thead>
                <tbody>
                  {contractApprovedEvents.length > 0 ? (
                    contractApprovedEvents.map((event) => (
                      <tr key={event.transactionIndex}>
                        <td>{event.address}</td>
                        <td>{event.blockHash}</td>
                        <td>{event.blockNumber}</td>
                        <td>{event.data}</td>
                        <td>{event.eventSignature}</td>
                        <td>{event.logIndex}</td>
                        <td>{event.removed}</td>
                        <td>{event.transactionHash}</td>
                        <td>{event.transactionIndex}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
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
