import React from "react";
import PaypalExpressBtn from "react-paypal-express-checkout";

export default class Paypal extends React.Component {
  render() {
    const { handleSuccess, order } = this.props;

    const onSuccess = (data) => {
      //   this.props.onSuccess(payment);
      handleSuccess(order, data, "Paypal", order.total);
    };

    const onCancel = () => {
      console.log(order);
    };

    const onError = (err) => {
      console.log("Error!", err);
    };

    let env = "sandbox";
    let currency = "USD";
    let total = order.total;

    const client = {
      sandbox:
        "ARdYSQ59aFp7Ha4HPOq21bLzI4Wyi_PclzGnnywcUCBHqvmAXayHOR2RSsLe3ikdbmdec1H5kDnz_2t0",
      production:
        "EAJeKkodSCxV53FIuyiqgCEnDS8M7BJfyyWGBKnwZp1_lJTu13NlPWA1kBW8ZLKLXHAXruZbDzCzDkfd",
    };

    return (
      <PaypalExpressBtn
        env={env}
        client={client}
        currency={currency}
        total={total}
        onError={onError}
        onSuccess={onSuccess}
        onCancel={onCancel}
        style={{
          size: "large",
          color: "blue",
          shape: "rect",
          label: "checkout",
        }}
      />
    );
  }
}
