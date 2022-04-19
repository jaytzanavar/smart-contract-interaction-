import { useEffect, useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import "./BlockchainLiveUpdate.css";
import blockchainImg from "../../assets/blockchain.png";

function openWSProvider(ethers, contractAddr, abi) {
  let wsProvider;
  let contractAddress;

  if (!!contractAddr === false) {
    contractAddress = localStorage?.getItem("contract");
  }

  if (ethers && !!contractAddress) {
    wsProvider = new ethers.providers.WebSocketProvider(
      "wss://rpc-mumbai.maticvigil.com/ws/v1/24fd79d31c2188c409ab1b82407fbe0bcba657bd"
    );

    let contract = new ethers.Contract(contractAddress, abi, wsProvider);
    console.log(contract);
    contract.on("*", (args) => {
      console.log(args);
    });
    let filter = {
      topics: [ethers.utils.id("Transfer(address,address,uint256)")],
    };
    wsProvider.on(filter, (log) => {
      console.log({
        log: log,
      });
    });
  }
}

export function BlockchainLiveUpdate({ ethers, contractAddr, abi }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    console.log("use EFFECT TRIGG", show);
    if (show) {
      openWSProvider(ethers, contractAddr, abi);
    }
  }, [show, ethers, contractAddr, abi]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <img src={blockchainImg} onClick={handleShow} alt="" />

      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Offcanvas</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          Some text as placeholder. In real life you can have the elements you
          have chosen. Like, text, images, lists, etc.
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
