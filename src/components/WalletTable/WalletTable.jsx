import Table from "react-bootstrap/Table";
import { useEffect, useState } from "react";
import { chainNames } from "src/assets/utils";

const { ethereum } = window;
export function WalletTable({ chain, account }) {
  console.log("Wallet Table render...", chain);
  const [currentBlock, setCurrentBlock] = useState();
  const [balance, setBalance] = useState(null);

  // balanceBigN();

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>ChainId</th>
          <th>Block Number</th>
          <th>Chain Name</th>
          <th>Balance</th>
        </tr>
      </thead>
      {/* {blockNum} */}
      <tbody>
        {chain.chainId !== 0 ? (
          <tr>
            <td>{chain.chainId}</td>
            <td>{chain.currentBlock} </td>
            <td>
              {chainNames.find((cn) => {
                console.log("===>", cn);
                console.log("===>>>>", chain.chainId);
                return cn.id === chain.chainId;
              }).name ?? "Not supported chain"}
            </td>
            <td>{chain.balance}</td>
          </tr>
        ) : (
          <tr>
            <td>0</td>
            <td>#</td>
            <td>Empty</td>
            <td>Empty</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

export default WalletTable;
