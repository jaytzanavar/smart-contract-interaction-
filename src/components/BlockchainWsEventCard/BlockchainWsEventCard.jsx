import Card from "react-bootstrap/Card";
import {
  checkBigNumber,
  checkTypeOfTransaction,
  checkTypeOfTransactionText,
} from "src/assets/utils";
import moment from "moment";

export function BlockchainWsEventCard({ data, ethers }) {
  console.log(data, ethers);
  const getTimeNow = () => {
    console.log(moment(new Date(Date.now())).format("DD/MM/YYYY hh:mm A"));
    return moment(new Date(Date.now())).format("DD/MM/YYYY  hh:mm A");
  };

  return (
    <>
      {!!data ? (
        <Card
          border={data.data.signerContract ? "primary" : "dark"}
          style={{ width: "auto", marginBottom: 15 }}
        >
          <Card.Header>
            <div className="d-flex justify-content-between">
              <div>{data.data.name}</div>
              <div style={{ fontSize: 12, paddingTop: 6 }}>{getTimeNow()}</div>
            </div>
          </Card.Header>
          <Card.Body>
            <Card.Title>{checkTypeOfTransaction(data.data.args)}</Card.Title>
            <Card.Text>{`${checkTypeOfTransactionText(
              data.data.args
            )}  ${checkBigNumber(ethers, data.data.args)}`}</Card.Text>
          </Card.Body>
        </Card>
      ) : null}
    </>
  );
}
