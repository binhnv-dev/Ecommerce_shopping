/*
 *
 * Account
 *
 */

import React from "react";
import { connect } from "react-redux";

import actions from "../../actions";

import AnalystDetail from "../../components/Manager/AnalystDetail";
import SubPage from "../../components/Manager/SubPage";

class Analyst extends React.PureComponent {
  componentDidMount() {
    this.props.fetchAnalyst();
  }

  render() {
    const { analyst } = this.props;

    return (
      <div className="account">
        <SubPage title={"Dashboard"} isMenuOpen={null}>
          <AnalystDetail analyst={analyst} />
        </SubPage>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    analyst: state.analyst.analyst,
  };
};

export default connect(mapStateToProps, actions)(Analyst);
