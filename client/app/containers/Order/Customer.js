/*
 *
 * Customer
 *
 */

import React from "react";

import { connect } from "react-redux";

import actions from "../../actions";

import SubPage from "../../components/Manager/SubPage";
import OrderList from "../../components/Manager/OrderList";
import OrderSearch from "../../components/Manager/OrderSearch";
import NotFound from "../../components/Common/NotFound";
import LoadingIndicator from "../../components/Common/LoadingIndicator";

class Customer extends React.PureComponent {
  componentDidMount() {
    this.props.fetchCustomerOrders();
  }

  render() {
    const { history, user, allOrders, isLoading, searchOrders } = this.props;
    return (
      <div className="order-dashboard">
        <SubPage
          title="Customer Orders"
          actionTitle="My Orders"
          handleAction={() =>
            user.role === "ROLE_ADMIN" && history.push("/dashboard/orders")
          }
        >
          <OrderSearch onSearchSubmit={searchOrders} />
          {isLoading ? (
            <LoadingIndicator inline />
          ) : allOrders.length > 0 ? (
            <OrderList orders={allOrders} />
          ) : (
            <NotFound message="No orders found." />
          )}
        </SubPage>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  console.log(state);
  return {
    user: state.account.user,
    orders: state.order.searchedOrders,
    allOrders: state.order.allOrders,
    isLoading: state.order.isLoading,
    isOrderAddOpen: state.order.isOrderAddOpen,
  };
};

export default connect(mapStateToProps, actions)(Customer);
