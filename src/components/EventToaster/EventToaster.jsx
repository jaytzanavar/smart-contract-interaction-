import Toast from "react-bootstrap/Toast";
import moment from "moment";
import "./EventToaster.css";
import { checkBigNumber, checkTypeOfTransaction } from "src/assets/utils";

//console.log(BigNumber.toString());

export function EventToaster(props) {
  const { ethers, show, variant, result, setData } = props;
  console.log(props);
  if (props.results) console.log("EVENT TOASTER PROPS", props);
  return (
    <Toast
      onClose={() => setData({ show: false })}
      show={show}
      className="event-toaster-style"
      bg={variant ? variant.toLowerCase() : ""}
    >
      <Toast.Header>
        <strong className="me-auto">
          {variant === "Primary" ? "Account Updates" : "Other Account Updates"}
        </strong>
        <small>{moment(new Date(Date.now())).fromNow()}</small>
      </Toast.Header>
      <Toast.Body className="text-light h5">
        {!!result && result !== null ? (
          <>
            <h4> {result.name}</h4>
            <h5>
              {checkTypeOfTransaction(result.args, result.name) +
                "  " +
                checkBigNumber(ethers, result.args)}
            </h5>
          </>
        ) : null}
      </Toast.Body>
    </Toast>
  );
}
