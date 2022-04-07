import { useWeb3React } from "@web3-react/core";
import { Contract } from "@ethersproject/contracts";
import BUSD from "../../contracts/BUSD.json";
import { formatUnits } from "@ethersproject/units";
import { useEffect } from "react";
import useSWR from "swr";

export const TokenBalance = ({ symbol, address, decimals }) => {
  // console.log(
  //   "🚀 ~ file: TokenBalance.jsx ~ line 9 ~ TokenBalance ~ symbol, address, decimals",
  //   symbol,
  //   address,
  //   decimals
  // );

  const { account, library } = useWeb3React();
  const { data: balance, mutate } = useSWR([address, "balanceOf", account]);

  useEffect(() => {
    // listen for changes on an Ethereum address
    const contract = new Contract(address, BUSD.abi, library.getSigner());
    // console.log(contract);
    const fromMe = contract.filters.Transfer(account, null);
    library.on(fromMe, (from, to, amount, event) => {
      // console.log("Transfer|sent", { from, to, amount, event });
      mutate(undefined, true);
    });
    const toMe = contract.filters.Transfer(null, account);
    library.on(toMe, (from, to, amount, event) => {
      // console.log("Transfer|received", { from, to, amount, event });
      mutate(undefined, true);
    });
    // remove listener when the component is unmounted
    return () => {
      library.removeAllListeners(toMe);
      library.removeAllListeners(fromMe);
    };
    // trigger the effect only on component mount
  }, []);

  if (!balance) {
    return <div>...</div>;
  }
  return (
    <div>
      HELLOOO
      {parseFloat(formatUnits(balance, decimals)).toPrecision(4)} {symbol}
    </div>
  );
};
