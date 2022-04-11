import { Formik } from "formik";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useState } from "react";

const { ethereum } = window;
export function TransferChainTokenToAccount({ ethers, utils }) {
  const [transferHash, setTransferHash] = useState("");
  const provider = new ethers.providers.Web3Provider(ethereum);
  // addr to send 0x9B678D348821d48D77a586DAbd1B5C394B4cA5f8
  async function sendAmountToAddress(data) {
    await provider.send("eth_requestAccounts", []);
    setTransferHash("Transaction is on process...");
    const signer = await provider.getSigner();
    const tx = {
      to: data.recipientAddress,
      value: utils.parseEther(data.amountOfTransfer),
    };

    await signer
      .sendTransaction(tx)
      .then((res) => {
        setTransferHash(`Transaction successfull (hash:${res.hash})`);
      })
      .catch((err) => {
        if (err.code === 4001) {
          setTransferHash("User rejected transaction...");
        }
      });
  }

  return (
    <>
      {provider === undefined ? null : (
        <>
          <h4>Transfer Token to Account</h4>
          <div className="container">
            <Formik
              initialValues={{
                recipientAddress: "",
                amountOfTransfer: 0,
              }}
              className="d-flex flex-column  justify-content-md-between"
              onSubmit={(data, { setSubmitting }) => {
                setSubmitting(true);
                // send data to the contract

                sendAmountToAddress(data);
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
                      Send tokens
                    </Form.Label>
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <Form.Control
                        type="text"
                        id="recipientAddress"
                        name="recipientAddress"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="@Recipient address"
                        value={values.recipientAddress}
                      />
                    </div>
                    <div className="col-6">
                      <Form.Control
                        type="text"
                        id="amountOfTransfer"
                        name="amountOfTransfer"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="amount of tokens"
                        value={values.amountOfTransfer}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <Button
                        disabled={
                          values.recipientAddress.length === 0 &&
                          values.amountOfTransfer === 0
                        }
                        className="mt-2 mb-2 align-self-center col-md-4"
                        variant="primary"
                        type="submit"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </Formik>
          </div>
        </>
      )}
    </>
  );
}

export default TransferChainTokenToAccount;
