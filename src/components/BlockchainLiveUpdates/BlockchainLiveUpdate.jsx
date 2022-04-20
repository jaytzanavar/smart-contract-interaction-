import { useEffect, useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import "./BlockchainLiveUpdate.css";
import blockchainImg from "../../assets/blockchain.png";
import { BlockchainWsEventCard } from "../BlockchainWsEventCard/BlockchainWsEventCard";

export function BlockchainLiveUpdate({ networkInfo, event }) {
  console.log("open panel ws");
  const [show, setShow] = useState(false);
  const [eventArrays, setEventArrays] = useState([]);
  useEffect(() => {
    if (show) {
    }
    return () => {
      // console.log("unmounting", show);
      // if (!!ws) {
      //   ws.provider._websocket.close();
      //   ws.contract.off("*", (args) => {
      //     console.log("unsubscribed from contract", args);
      //   });
      //   console.log("terminating ws...");
      // }
    };
  }, [show]);

  useEffect(() => {
    if (event.data != null) {
      console.log("HAVE CAUGHT A LIVE EVENT ===>", event);
      setEventArrays((prevState) => [...prevState, event]);
    }
  }, [event]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <img src={blockchainImg} onClick={handleShow} alt="" />

      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            Live Transaction Data from {networkInfo.name} ({networkInfo.chainId}
            )
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {eventArrays.length > 0
            ? eventArrays.map((event, index) => (
                <BlockchainWsEventCard key={index} />
              ))
            : null}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
