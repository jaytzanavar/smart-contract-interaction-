import Card from "react-bootstrap/Card";

export function BlockchainWsEventCard({}) {
  return (
    <>
      <Card border="dark" style={{ width: "auto" }}>
        <Card.Header>Dark card</Card.Header>
        <Card.Body>
          <Card.Title>Primary Card Title</Card.Title>
          <Card.Text>
            Some quick example text to build on the card title and make up the
            bulk of the card's content.
          </Card.Text>
        </Card.Body>
      </Card>
    </>
  );
}
