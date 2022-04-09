import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import MaticImg from "../../assets/matic.png";
import EthImg from "../../assets/eth.png";
import BscImg from "../../assets/bsc.png";
import { networks } from "src/assets/utils";

export default function ChangeChainModal() {
  const [show, setShow] = useState(false);
  const [error, setError] = useState();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const changeNetwork = async ({ networkName, setError }) => {
    try {
      if (!window.ethereum) throw new Error("No crypto wallet found");

      if (networkName === "ethereum") {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x1" }],
        });
      } else {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              ...networks[networkName],
            },
          ],
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };
  // async handle to change network
  const handleNetworkSwitch = async (networkName) => {
    setError();
    await changeNetwork({ networkName, setError });
    handleClose();
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Change network
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {" "}
          <div className="container">
            <div className="row">
              <div className="d-flex justify-content-center">
                <button
                  onClick={() => handleNetworkSwitch("ethereum")}
                  className="button-change-blockchain d-flex justify-content-center"
                >
                  <img className="button-eth" src={EthImg} alt="" />
                  <span>Ethereum</span>
                </button>
              </div>
              <div className="d-flex justify-content-center">
                <button
                  onClick={() => handleNetworkSwitch("bsc")}
                  className="button-change-blockchain  d-flex justify-content-center"
                >
                  <img className="button-bsc" src={BscImg} alt="" />
                  <span>SmartChain</span>
                </button>
              </div>
              <div className="d-flex justify-content-center">
                <button
                  onClick={() => handleNetworkSwitch("polygon")}
                  className="button-change-blockchain d-flex justify-content-center"
                >
                  <img className="button-matic" src={MaticImg} alt="" />
                  <span>Polygon</span>
                </button>
              </div>
              <div className="d-flex justify-content-center">
                <button
                  onClick={() => handleNetworkSwitch("mumbai")}
                  className="button-change-blockchain d-flex justify-content-center"
                >
                  <img className="button-matic" src={MaticImg} alt="" />
                  <span>Mumbai(TestNet)</span>
                </button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
