import { useEffect, useState, useRef } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import "./BlockchainLiveUpdate.css";
import blockchainImg from "../../assets/blockchain.png";
import { BlockchainWsEventCard } from "../BlockchainWsEventCard/BlockchainWsEventCard";

export function BlockchainLiveUpdate({ networkInfo, event, ethers }) {
  console.log("open panel ws", networkInfo);
  const [show, setShow] = useState(false);
  const [eventArrays, setEventArrays] = useState([]);
  const refArray = useRef([]);
  refArray.current = [];

  useEffect(() => {
    if (event.data != null) {
      console.log("HAVE CAUGHT A LIVE EVENT ===>", event);
      const newEvent = { ...event, id: 0 };
      setEventArrays((prevState) => [
        ...prevState,
        { ...newEvent, id: prevState.id + 1 },
      ]);
    }
  }, [event]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <img src={blockchainImg} onClick={handleShow} alt="" />
      {!!networkInfo ? (
        <Offcanvas show={show} onHide={handleClose}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              Live Transaction Data from {networkInfo.name} (
              {networkInfo.chainId})
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            {eventArrays.length > 0
              ? eventArrays.map((event, index) => (
                  <BlockchainWsEventCard
                    key={index}
                    data={event}
                    ethers={ethers}
                  />
                ))
              : null}
          </Offcanvas.Body>
        </Offcanvas>
      ) : null}
    </>
  );
}
