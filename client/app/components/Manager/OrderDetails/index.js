/**
 *
 * OrderDetails
 *
 */

import React, { useState, useEffect } from 'react';

import { Row, Col, Button } from 'reactstrap';

import OrderMeta from '../OrderMeta';
import OrderItems from '../OrderItems';
import OrderSummary from '../OrderSummary';
import Paypal from '../Paypal';
import StripeCheckout from 'react-stripe-checkout';
import image from '../../../../public/images/industrious-logo.png';
import key from '../../../../../server/config/keys';

const OrderDetails = (props) => {
  const {
    order,
    user,
    cancelOrder,
    updateOrderItemStatus,
    paidOrderSuccess,
    onBack,
  } = props;

  const [stripeToken, setStripeToken] = useState(null);
  const onToken = (token) => {
    setStripeToken(token);
  };

  useEffect(() => {
    const makeRequest = () => {
      paidOrderSuccess(
        order,
        stripeToken,
        'Credit',
        order.total,
        stripeToken.id
      );
    };
    stripeToken && makeRequest();
  }, [stripeToken, order.total]);
  return (
    <div className="order-details">
      <Row>
        <Col xs="12" md="12">
          <OrderMeta order={order} cancelOrder={cancelOrder} onBack={onBack} />
        </Col>
      </Row>
      <Row className="mt-5">
        <Col xs="12" lg="8">
          <OrderItems
            order={order}
            user={user}
            updateOrderItemStatus={updateOrderItemStatus}
          />
        </Col>
        <Col xs="12" lg="4" className="mt-5 mt-lg-0">
          <OrderSummary order={order} />
          {user?._id === order?.user && !order.isPaid ? (
            <div>
              <StripeCheckout
                name={'Mei Store'}
                image={image}
                shippingAddress
                description={`Your total is $${order.total}`}
                email={user.email}
                amount={order.total * 100}
                currency="USD"
                stripeKey={key.stripe.key}
                token={onToken}
              >
                <Button className="w-100 btn-dark text-light">
                  Checkout With Credit Card
                </Button>
              </StripeCheckout>
            </div>
          ) : (
            ''
          )}

          {user?._id === order?.user && !order.isPaid ? (
            <Paypal order={order} handleSuccess={paidOrderSuccess} />
          ) : (
            ''
          )}
        </Col>
      </Row>
    </div>
  );
};

export default OrderDetails;
