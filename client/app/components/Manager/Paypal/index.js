import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const Paypal = ({ order, handleSuccess }) => {
  const amount = order.total;

  const onApprove = (data, actions) => {
    return actions.order.capture().then((details) => {
      handleSuccess(order, details, 'Paypal', amount);
    });
  };

  const onError = (err) => {
    console.error('Payment Error:', err);
  };

  const onCancel = (data) => {
    console.log('Payment Cancelled:', data);
  };

  const clientId =
    'ARdYSQ59aFp7Ha4HPOq21bLzI4Wyi_PclzGnnywcUCBHqvmAXayHOR2RSsLe3ikdbmdec1H5kDnz_2t0';
  return (
    <PayPalScriptProvider
      options={{
        'client-id': clientId,
        currency: 'USD',
        intent: 'capture',
      }}
    >
      <PayPalButtons
        style={{
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'checkout',
        }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount.toString(),
                },
              },
            ],
          });
        }}
        onApprove={onApprove}
        onError={onError}
        onCancel={onCancel}
      />
    </PayPalScriptProvider>
  );
};

export default Paypal;
