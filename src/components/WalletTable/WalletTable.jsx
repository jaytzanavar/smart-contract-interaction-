import Table from "react-bootstrap/Table";
import { useEffect, useState } from "react";
import { chainNames } from "src/assets/utils";

const { ethereum } = window;
export function WalletTable({ account, ethers }) {
  console.log("Wallet Table render...");
  const [chain, setChain] = useState(() => {
    return {
      chainId: 0,
      ensAddress: "",
      name: "",
      balance: 0,
      currentBlock: "",
    };
  });

  let updateChain = async (account) => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const network = await provider.getNetwork();
    const bal = await provider.getBalance(account);
    const block = await provider.getBlockNumber();

    setChain({
      balance: ethers.utils.formatUnits(bal),
      chainId: network.chainId,
      ensAddress: network.ensAddress,
      name: network.name,
      currentBlock: block,
    });
  };

  useEffect(() => {
    updateChain(account);
    return () => {
      console.log("useEffect cleaned up");
    };
  }, [account]);
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

      <tbody>
        {chain.chainId !== 0 ? (
          <tr>
            <td>{chain.chainId}</td>
            <td>{chain.currentBlock} </td>
            <td>
              {chainNames.find((cn) => {
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
