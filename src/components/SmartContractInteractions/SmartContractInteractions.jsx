import { Formik } from "formik";
import { useState } from "react";
import Mint from "../Mint/Mint.jsx";
import Ownership from "../Ownership/Ownership.jsx";
import BUSD from "../../contracts/BUSD.json";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

export function SmartContractInteractions({
  provider,
  ethers,
  contractInfo,
  contract,
  signer,
}) {
  if (!signer) {
    if (!!provider) {
      signer = provider.getSigner();
    }
  }
  const [transferHash, setTransferHash] = useState(null);
  //check allowance of spender
  async function setGrantApproval(data) {
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const getSignerAddr = signer.getAddress();
    const contract = new ethers.Contract(
      contractInfo[0].accountAddress,
      BUSD.abi,
      signer
    );

    const grantApproval = await contract.approve(
      getSignerAddr,
      data.valueToApprove
    );
  }

  // Send From
  async function sendTransferFromTo({ from, to, amount }) {
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      contractInfo[0].accountAddress,
      BUSD.abi,
      signer
    );
    let weiAmount = amount === 0 ? 0 : ethers.utils.formatEther(amount);

    try {
      await contract.transferFrom(from, to, weiAmount).then((res) => {
        setTransferHash({ sendTransferFrom: res.hash });
      });
    } catch (er) {
      console.error(er);
    }
  }

  //Burn
  async function BurnTokens(data) {
    // TODO get balance and block the burn
    await contract.burn(ethers.utils.parseEther(data.amount)).then((res) => {
      const txHash = res.hash;

      setTransferHash({ burn: txHash });
    });
  }

  return (
    <>
      <h4>Smart Contract interactions</h4>
      {/*START Approve spending Tokens */}
      <div className="container">
        <div className="row">
          <Formik
            initialValues={{ valueToApprove: 0 }}
            className="d-flex flex-column  justify-content-md-between"
            onSubmit={(data, { setSubmitting }) => {
              setSubmitting(true);
              // send data to the contract

              setGrantApproval(data);
              setSubmitting(false);
            }}
          >
            {({
              values,
              isSubmitting,
              handleChange,
              handleBlur,
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <Form.Label className="mt-2 mb-2 h4">
                    Approve spending tokens
                  </Form.Label>
                </div>
                <div className="row">
                  <div className="col-5">
                    <Form.Control
                      type="text"
                      id="valueToApprove"
                      name="valueToApprove"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="amount of tokens"
                      value={values.valueToApprove}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <Button
                      disabled={contractInfo.length === 0}
                      className="mt-2 mb-2 align-self-center col-md-4"
                      variant="primary"
                      type="submit"
                    >
                      Grant Approval to value {values.valueToApprove}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
      {/*END Approve spending Tokens */}

      {/*START Transfer from */}
      <div className="container">
        <div className="row">
          <Formik
            initialValues={{ from: "", to: "", amount: 0 }}
            className="d-flex flex-column  justify-content-md-between"
            onSubmit={(data, { setSubmitting }) => {
              setSubmitting(true);
              // send data to the contract

              sendTransferFromTo(data);
              setSubmitting(false);
            }}
          >
            {({
              values,
              isSubmitting,
              handleChange,
              handleBlur,
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <Form.Label className="mt-2 mb-2 h4">
                    Transfer{" "}
                    {contractInfo.length > 0 ? contractInfo[0].tokenSymbol : ""}{" "}
                    Tokens From <span>&#8594;</span> To
                  </Form.Label>
                </div>
                <div className="row">
                  <div className="col-5">
                    <Form.Control
                      type="text"
                      id="from"
                      name="from"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="@Address From"
                      value={values.from}
                    />
                  </div>
                  <div className="col-5">
                    <Form.Control
                      type="text"
                      id="to"
                      name="to"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="@Address Recipient"
                      value={values.to}
                    />
                  </div>
                  <div className="col-2">
                    <Form.Control
                      type="text"
                      id="amount"
                      name="amount"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Amount of Tokens"
                      value={values.amount}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-6">
                    <Button
                      disabled={contractInfo.length === 0}
                      className="mt-2 mb-2 align-self-center col-md-4"
                      variant="primary"
                      type="submit"
                    >
                      Send Tokens
                    </Button>
                  </div>
                  <div className="col-6 pt-2">
                    <div className="h6">
                      Transaction:{" "}
                      {transferHash !== null ??
                        transferHash["sendTransferFrom"] ??
                        null}
                    </div>
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
      {/*END Transfer from*/}

      {/*START Burn  */}
      <div className="container">
        <div className="row">
          <Formik
            initialValues={{ amount: 0 }}
            className="d-flex flex-column  justify-content-md-between"
            onSubmit={(data, { setSubmitting }) => {
              setSubmitting(true);
              // send data to the contract

              BurnTokens(data);
              setSubmitting(false);
            }}
          >
            {({
              values,
              isSubmitting,
              handleChange,
              handleBlur,
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <Form.Label className="mt-2 mb-2 h4">
                    Burn
                    {contractInfo.length > 0
                      ? `  ${contractInfo[0].tokenSymbol}`
                      : ""}{" "}
                    Tokens
                  </Form.Label>
                </div>
                <div className="row">
                  <div className="col-5">
                    <Form.Control
                      type="text"
                      id="amount"
                      name="amount"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Token amount to burn"
                      value={values.amount}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-6">
                    <Button
                      disabled={contractInfo.length === 0}
                      className="mt-2 mb-2 align-self-center col-md-4"
                      variant="primary"
                      type="submit"
                    >
                      Burn
                    </Button>
                  </div>
                  <div className="col-6 pt-2">
                    <div className="h6">
                      Transaction{" "}
                      {transferHash !== null ?? transferHash["burn"] ?? null}
                    </div>
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
      {/*END Burn*/}
      {/* START Mint */}
      <Mint
        provider={provider}
        contract={contract}
        contractInfo={contractInfo}
      />
      {/* End Mint */}
      {/* START Ownership */}
      <Ownership signerAsync={signer} contract={contract} />
      {/* End Ownership */}
    </>
  );
}

export default SmartContractInteractions;
