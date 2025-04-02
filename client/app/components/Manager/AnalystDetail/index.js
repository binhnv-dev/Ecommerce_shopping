/**
 *
 * Analyst
 *
 */
import React from "react";
import { Row, Col } from "reactstrap";
import Chart from "../../Common/Chart";
import FeatureInfo from "../../Common/FeatureInfo";

const AnalystDetail = (props) => {
  const { analyst } = props;

  const data = [
    {
      name: "Dec",
      Total: analyst.dec,
    },
    {
      name: "Jan",
      Total: analyst.jan,
    },
    {
      name: "Feb",
      Total: analyst.feb,
    },
    {
      name: "Mar",
      Total: analyst.mar,
    },
  ];
  return (
    <div className="account-details">
      <div className="info">
        <div className="desc">
          <FeatureInfo data={data} analyst={analyst} />
          <Chart data={data} title={"Incoming Analyst"} grid dataKey="Total" />
        </div>
      </div>
    </div>
  );
};

export default AnalystDetail;
