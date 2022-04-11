import Toast from "react-bootstrap/Toast";
import moment from "moment";
import { useState } from "react";
import "./ResultToaster.css";

export function ResultToaster(props) {
  const { show, variant, result, setData } = props;
  return (
    <Toast
      onClose={() => setData({ show: false })}
      show={show}
      className="toaster-style"
      bg={variant ? variant.toLowerCase() : ""}
    >
      <Toast.Header>
        <strong className="me-auto">{variant}</strong>
        <small>{moment(new Date(Date.now())).fromNow()}</small>
      </Toast.Header>
      <Toast.Body className="text-light h5">{result}</Toast.Body>
    </Toast>
  );
}
