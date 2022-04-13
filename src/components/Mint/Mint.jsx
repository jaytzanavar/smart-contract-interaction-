import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Formik } from "formik";
import { ethers } from "ethers";
import { useState } from "react";
import { ResultToaster } from "../ResultToaster/ResultToaster.jsx";

export function Mint({ contract, provider, contractInfo, refresh }) {
  const [toastData, setToasterData] = useState({
    show: false,
    result: "",
    variant: "",
  });
  const MintTokens = async (data) => {
    await contract
      .mint(ethers.utils.parseEther(data.amount))
      .then(async (res) => {
        setToasterData({
          show: true,
          result: "Minting token Pending... ",
          variant: "Warning",
        });

        await res.wait().then((res) => {});
        setToasterData({
          show: true,
          result: "Send transfer successful",
          variant: "Success",
        });
        setTimeout(async () => {
          setToasterData({
            ...toastData,
            show: false,
          });
        }, 2500);
        setTimeout(() => {
          refresh();
        }, 1000);
      });
  };

  return (
    <>
      {/*START Mint  */}
      <div className="container mt-5">
        <div className="row">
          <Formik
            initialValues={{ amount: 0 }}
            className="d-flex flex-column  justify-content-md-between"
            onSubmit={(data, { setSubmitting }) => {
              setSubmitting(true);
              // send data to the contract

              MintTokens(data);
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
                    Mint
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
                      Mint
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
      <ResultToaster
        result={toastData.result}
        show={toastData.show}
        variant={toastData.variant}
        setData={setToasterData}
      />
    </>
  );
}

export default Mint;
