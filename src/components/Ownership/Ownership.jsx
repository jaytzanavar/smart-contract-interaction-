import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Formik } from "formik";
import { useState } from "react";
import { ResultToaster } from "../ResultToaster/ResultToaster.jsx";

export function Ownership({ contract, refresh }) {
  const [isOwner, setIsOwner] = useState(null);
  const [contractOwner, setContractOwner] = useState(null);
  const [signer, setSigner] = useState(null);
  const [toastData, setToasterData] = useState({
    show: false,
    result: "",
    variant: "",
  });

  async function checkIfOwner() {
    await contract.getOwner().then(async (res) => {
      const signerAdd = await contract.signer.getAddress();

      setSigner(signerAdd);
      setContractOwner(res);

      const isSignerOwner = res === signerAdd;
      setIsOwner(isSignerOwner);
    });
  }

  async function renounceContract() {
    await contract.renounceOwnership().then(async (res) => {
      setToasterData({
        show: true,
        result: `Renouncing ownership  Pending... `,
        variant: "Warning",
      });
      await res.wait().then((res) => {});
      setTimeout(async () => {
        setToasterData({
          show: true,
          result: `Ownership renounced successfully`,
          variant: "Success",
        });
      }, 2500);
      setTimeout(async () => {
        setToasterData({
          show: false,
          ...toastData,
        });
      }, 3500);
    });
  }

  const transferOwnership = async (data) => {
    await contract
      .transferOwnership(data.ownershipAddress)
      .then(async (res) => {
        setToasterData({
          show: true,
          result: `Transfer ownership to ${data.ownershipAddress}  Pending... `,
          variant: "Warning",
        });
        await res.wait().then((res) => {});
        setTimeout(async () => {
          setToasterData({
            show: true,
            result: `Ownership transfered ${data.ownershipAddress} successful`,
            variant: "Success",
          });
        }, 2500);
        setTimeout(() => {
          setToasterData({
            ...toastData,
            show: false,
          });
          refresh();
        }, 3000);
      });
  };

  return (
    <>
      {/*START Burn  */}
      <div className="container mt-5">
        <div className="row">
          <Formik
            initialValues={{ amount: 0 }}
            className="d-flex flex-column  justify-content-md-between"
            onSubmit={(data, { setSubmitting }) => {
              setSubmitting(true);
              // send data to the contract
              checkIfOwner(data);
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
                    Is {signer} owner of Contract ?
                  </Form.Label>
                </div>
                <div className="row">
                  <div className="col-10">
                    {isOwner !== false && isOwner !== null
                      ? "yeap !"
                      : isOwner === null
                      ? ``
                      : `nope ${contractOwner} is the owner`}
                  </div>
                </div>
                <div className="row">
                  <div className="col-6">
                    <Button
                      className="mt-2 mb-2 align-self-center col-md-4"
                      variant="primary"
                      type="submit"
                      disabled={contract === null}
                    >
                      Check Ownership
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
      {isOwner === true ? (
        <div className="container">
          <div className="row">
            <Formik
              initialValues={{ amount: 0 }}
              className="d-flex flex-column  justify-content-md-between"
              onSubmit={(data, { setSubmitting }) => {
                setSubmitting(true);
                // send data to the contract

                renounceContract(data);
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
                      Renounce Ownership
                    </Form.Label>
                  </div>

                  <div className="row">
                    <div className="col-6">
                      <Button
                        className="mt-2 mb-2 align-self-center col-md-4"
                        variant="primary"
                        type="submit"
                      >
                        Renounce contract
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </Formik>
          </div>
          <div className="row">
            <Formik
              initialValues={{ ownershipAddress: "" }}
              className="d-flex flex-column  justify-content-md-between"
              onSubmit={(data, { setSubmitting }) => {
                setSubmitting(true);
                // send data to the contract

                transferOwnership(data);
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
                      Transfer Ownership
                    </Form.Label>
                  </div>

                  <div className="row">
                    <div className="col-6">
                      <Form.Control
                        type="text"
                        id="ownershipAddress"
                        name="ownershipAddress"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="@address"
                        value={values.ownershipAddress}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <Button
                        className="mt-2 mb-2 align-self-center col-md-4"
                        variant="primary"
                        type="submit"
                      >
                        Transfer contract
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </Formik>
          </div>
        </div>
      ) : (
        <></>
      )}
      <ResultToaster
        result={toastData.result}
        show={toastData.show}
        variant={toastData.variant}
        setData={setToasterData}
      />
    </>
  );
}

export default Ownership;
