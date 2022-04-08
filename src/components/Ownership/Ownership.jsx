import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Formik } from "formik";
import { useState } from "react";

export function Ownership({ contract, signerAsync }) {
  const [isOwner, setIsOwner] = useState(false);
  const [contractOwner, setContractOwner] = useState(null);
  const [signer, setSigner] = useState(null);
  const [transferHash, setTransferHash] = useState(null);
  async function checkIfOwner() {
    await contract.getOwner().then(async (res) => {
      const signerAdd = await signerAsync.getAddress();
      console.log(signerAdd);
      console.log(res);
      setSigner(signerAdd);
      setContractOwner(res);
      console.log(res === signerAdd);
      const isSignerOwner = res === signerAdd;
      setIsOwner(isSignerOwner);
      console.log(isOwner);
    });
  }

  async function renounceContract() {
    const renounceContract = await contract.renounceOwnership().then((res) => {
      console.log(res);
      checkIfOwner();
    });
  }
  return (
    <>
      {/*START Burn  */}
      <div className="container">
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
                    {isOwner !== false
                      ? "yeap !"
                      : `nope ${contractOwner} is the owner`}
                  </div>
                </div>
                <div className="row">
                  <div className="col-6">
                    <Button
                      className="mt-2 mb-2 align-self-center col-md-4"
                      variant="primary"
                      type="submit"
                    >
                      Mint
                    </Button>
                  </div>
                  <div className="col-6 pt-2">
                    <div className="h6">
                      Transaction
                      {transferHash !== null ?? transferHash["mint"] ?? null}
                    </div>
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
                      So ({contractOwner}) as owner of the Contract do you want
                      to Renounce it?
                    </Form.Label>
                  </div>

                  <div className="row">
                    <div className="col-6">
                      <Button
                        className="mt-2 mb-2 align-self-center col-md-4"
                        variant="primary"
                        type="submit"
                      >
                        Renounce contract!
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
    </>
  );
}

export default Ownership;
