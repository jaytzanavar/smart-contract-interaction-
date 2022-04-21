import { Formik } from "formik";
import { useState } from "react";
import Ownership from "../Ownership/Ownership.jsx";
import BUSD from "../../contracts/BUSD.json";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { ResultToaster } from "../ResultToaster/ResultToaster.jsx";
import Mint from "../Mint/Mint.jsx";

export function SmartContractInteractions({ contractProps, refresh }) {
  const [toastData, setToasterData] = useState({
    show: false,
    result: "",
    variant: "",
  });

  let { provider, ethers, contractInfo, contract, signer } = contractProps;
  const [allowance, setAllowance] = useState("");

  //set approval of allowance of spender
  async function setGrantApproval(data) {
    if (data.addressOfApproval) {
      await contract
        .approve(
          data.addressOfApproval,
          ethers.utils.parseEther(data.valueToApprove)
        )
        .then(
          async (res) => {
            setToasterData({
              show: true,
              result: "Approve Pending... ",
              variant: "Warning",
            });
            await res.wait().then((res) => {});

            setTimeout(() => {
              setToasterData({
                show: false,
                result: "Approve successful",
                variant: "Success",
              });
            }, 2500);
            setTimeout(() => {
              setToasterData({
                show: false,
                result: "Approve successful",
                variant: "Success",
              });
            }, 3500);
          },
          (err) => {
            setToasterData({
              show: true,
              result: "Approval unsuccessful",
              variant: "Warning",
            });
            setTimeout(() => {
              setToasterData({
                show: false,
                result: "Approve successful",
                variant: "Warning",
              });
            }, 2500);
          }
        );
    }
  }

  // Check allowance
  const checkAllowance = async (addressOfAllowance) => {
    if (!contract) {
      contract = new ethers.Contract(
        contractInfo[0].accountAddress,
        BUSD.abi,
        signer
      );
    }
    const signerAddress = await contract.signer.getAddress();
    await contract.allowance(signerAddress, addressOfAllowance).then(
      async (res) => {
        setToasterData({
          show: true,
          result: "Allowance request successful",
          variant: "Success",
        });
        setAllowance(ethers.utils.formatEther(res));
        setTimeout(() => {
          setToasterData({
            show: false,
            result: "Allowance request successful",
            variant: "Success",
          });
        }, 2500);
      },
      (err) => {
        setToasterData({
          show: true,
          result: "Allowance request unsuccessful",
          variant: "Warning",
        });
        setTimeout(() => {
          setToasterData({
            show: false,
            result: "Allowance request successful",
            variant: "Warning",
          });
        }, 2500);
      }
    );
  };

  const transferContractToken = async ({ to, amount }) => {
    // `recipient` cannot be the zero address. - the caller must have a balance of at least `amount`."
    const signerAddress = await contract.signer.getAddress();

    let balance = await contract.balanceOf(signerAddress);
    let confirmTransfer = true;
    if (to.length === 0 || to === null) {
      setToasterData({
        show: true,
        result: "Cannot send to empty address",
        variant: "Warning",
      });
      setTimeout(() => {
        setToasterData({
          show: false,
          result: "Cannot send to empty address",
          variant: "Warning",
        });
      }, 2500);
      confirmTransfer = false;
    }

    if (amount > parseInt(ethers.utils.formatUnits(balance), 10)) {
      confirmTransfer = false;
      setToasterData({
        show: true,
        result: "Exceed balance",
        variant: "Warning",
      });
      setTimeout(() => {
        setToasterData({
          show: false,
          result: "Exceed balance",
          variant: "Warning",
        });
      }, 2500);
    } else {
    }
    try {
      if (confirmTransfer) {
        let weiAmount = amount === 0 ? 0 : ethers.utils.parseUnits(amount);
        await contract.transfer(to, weiAmount).then(async (res) => {
          setToasterData({
            show: true,
            result: "Transaction Pending... ",
            variant: "Warning",
          });
          await res.wait().then((res) => {});
          setTimeout(async () => {
            setToasterData({
              show: false,
              result: "Send transfer successful",
              variant: "Success",
            });
          }, 4500);
          setTimeout(() => {
            refresh();
          }, 6000);
        });
      }
    } catch (res) {
      setToasterData({
        show: true,
        result: "Send transfer unsuccessful",
        variant: "Warning",
      });
      setTimeout(() => {
        setToasterData({
          show: false,
          result: "Send transfer successful",
          variant: "Warning",
        });
      }, 2500);
    }
  };

  // Send From
  async function sendTransferFromTo({ from, to, amount }) {
    await provider.send("eth_requestAccounts", []);

    if (!contract) {
      contract = new ethers.Contract(
        contractInfo[0].accountAddress,
        BUSD.abi,
        signer
      );
    }
    //parseUnits
    let weiAmount = amount === 0 ? 0 : ethers.utils.parseUnits(amount);
    try {
      await contract.transferFrom(from, to, weiAmount).then(async (res) => {
        setToasterData({
          show: true,
          result: "Transaction Pending... ",
          variant: "Warning",
        });
        await res.wait().then((res) => {});
        setTimeout(async () => {
          setToasterData({
            show: false,
            result: "Send transfer successful",
            variant: "Success",
          });
        }, 2500);
        setTimeout(() => {
          refresh();
        }, 1000);
      });
    } catch (err) {
      setToasterData({
        show: true,
        result: "Send transfer unsuccessful",
        variant: "Warning",
      });
      setTimeout(() => {
        setToasterData({
          show: false,
          result: "Send transfer successful",
          variant: "Warning",
        });
      }, 2500);
    }
  }

  //Burn
  async function BurnTokens(data) {
    // TODO get balance and block the burn
    await contract
      .burn(ethers.utils.parseEther(data.amount))
      .then(async (res) => {
        setToasterData({
          show: true,
          result: "Burn Transaction Pending... ",
          variant: "Warning",
        });
        await res.wait().then((res) => {});
        setTimeout(async () => {
          setToasterData({
            show: false,
            result: "Burn Transaction successful",
            variant: "Success",
          });
        }, 2500);
        setTimeout(() => {
          refresh();
        }, 1000);
      });
  }

  return (
    <>
      <h4>Smart Contract Interactions</h4>
      {/*START Transfer from */}
      <div className="container mt-5">
        <div className="row">
          <Formik
            initialValues={{ to: "", amount: 0 }}
            className="d-flex flex-column  justify-content-md-between"
            onSubmit={(data, { setSubmitting }) => {
              setSubmitting(true);
              // send data to the contract

              transferContractToken(data);
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
                    Transfer BUSD
                  </Form.Label>
                </div>
                <div className="row">
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
                  <div className="col-5">
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
                      Send BUSD
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
      {/*END Transfer from*/}
      {/*START Approve spending Tokens */}
      <div className="container">
        <div className="row">
          <Formik
            initialValues={{ valueToApprove: 0, addressOfApproval: "" }}
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
                      id="addressOfApproval"
                      name="addressOfApproval"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="@address of Approval"
                      value={values.addressOfApproval}
                    />
                  </div>
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
                  <div className="col-6">
                    <Button
                      disabled={contractInfo.length === 0}
                      className="mt-2 mb-2 align-self-center col-md-4"
                      variant="primary"
                      type="submit"
                    >
                      Grant Approval
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
      {/*END Approve spending Tokens */}

      {/* Start set Allowance */}
      <div className="container mt-5">
        <div className="row">
          <Formik
            initialValues={{ allowanceAddress: "", amount: 0 }}
            className="d-flex flex-column  justify-content-md-between"
            onSubmit={(data, { setSubmitting }) => {
              setSubmitting(true);
              // send data to the contract

              checkAllowance(data.allowanceAddress);
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
                    Check Allowance of spending
                  </Form.Label>
                </div>
                <div className="row">
                  <div className="col-5">
                    <Form.Control
                      type="text"
                      id="allowanceAddress"
                      name="allowanceAddress"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="@Address"
                      value={values.allowanceAddress}
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
                      Check Allowance
                    </Button>
                  </div>
                  <div className="col-6 pt-2">
                    <div className="h6">
                      {allowance
                        ? `Token spending allowance:
                      ${allowance}`
                        : null}
                    </div>
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
      {/* Stop set Allowance */}

      {/*START Transfer from */}
      <div className="container mt-5">
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
                  <div className="col-4">
                    <Form.Control
                      type="text"
                      id="from"
                      name="from"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="@Address Sender"
                      value={values.from}
                    />
                  </div>
                  <div className="col-4">
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
                  <div className="col-4">
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
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
      {/*END Transfer from*/}

      {/*START Burn  */}
      <div className="container mt-5">
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
                      Burn Tokens
                    </Button>
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
        refresh={refresh}
      />
      {/* End Mint */}

      {/* START Ownership */}
      <Ownership signerAsync={signer} contract={contract} refresh={refresh} />
      {/* End Ownership */}

      <ResultToaster
        result={toastData.result}
        show={toastData.show}
        variant={toastData.variant}
        setData={setToasterData}
      />
    </>
  );
}

export default SmartContractInteractions;
