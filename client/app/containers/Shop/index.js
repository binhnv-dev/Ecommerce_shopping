import React from 'react';

import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { Col, Row } from 'reactstrap';

import actions from '../../actions';

import BrandsShop from '../BrandsShop';
import CategoryShop from '../CategoryShop';
import ProductsShop from '../ProductsShop';

import Page404 from '../../components/Common/Page404';
import Pagination from '../../components/Common/Pagination';
import SelectOption from '../../components/Common/SelectOption';
import ProductFilter from '../../components/Store/ProductFilter';
import { sortOptions } from '../../constants';

class Shop extends React.PureComponent {
  componentDidMount() {
    document.body.classList.add('shop-page');
  }

  componentWillUnmount() {
    document.body.classList.remove('shop-page');
  }

  render() {
    const { products, advancedFilters, filterProducts } = this.props;
    const { totalProducts, pageNumber, pages, order } = advancedFilters;

    const startProduct = totalProducts === 0 ? 0 : (pageNumber - 1) * 8 + 1;
    const endProduct = Math.min(totalProducts, pageNumber * 8);
    return (
      <div className="shop">
        <Row xs="12">
          <Col
            xs={{ size: 12, order: 1 }}
            sm={{ size: 12, order: 1 }}
            md={{ size: 12, order: 1 }}
            lg={{ size: 3, order: 1 }}
          >
            <ProductFilter
              totalProducts={totalProducts}
              pageNumber={pageNumber}
              filterProducts={filterProducts}
            />
          </Col>
          <Col
            xs={{ size: 12, order: 2 }}
            sm={{ size: 12, order: 2 }}
            md={{ size: 12, order: 2 }}
            lg={{ size: 9, order: 2 }}
          >
            <Row className="align-items-center">
              <Col
                xs={{ size: 12, order: 1 }}
                sm={{ size: 12, order: 1 }}
                md={{ size: 5, order: 1 }}
                lg={{ size: 6, order: 1 }}
                className="text-center text-md-left mt-3 mt-md-0 mb-1 mb-md-0"
              >
                <b>Hiển thị: </b>
                {`${startProduct} – ${endProduct}/${totalProducts} sản phẩm`}
              </Col>
              <Col
                xs={{ size: 12, order: 2 }}
                sm={{ size: 12, order: 2 }}
                md={{ size: 2, order: 2 }}
                lg={{ size: 2, order: 2 }}
                className="text-right pr-0 d-none d-md-block"
              >
                <b>Sắp xếp theo</b>
              </Col>
              <Col
                xs={{ size: 12, order: 2 }}
                sm={{ size: 12, order: 2 }}
                md={{ size: 5, order: 2 }}
                lg={{ size: 4, order: 2 }}
              >
                <SelectOption
                  name={'sorting'}
                  value={{ value: order, label: sortOptions[order].label }}
                  options={sortOptions}
                  handleSelectChange={(n, v) => {
                    filterProducts('sorting', n.value);
                  }}
                />
              </Col>
            </Row>
            <Switch>
              <Route exact path="/shop" component={ProductsShop} />
              <Route path="/shop/category/:slug" component={CategoryShop} />
              <Route path="/shop/brand/:slug" component={BrandsShop} />
              <Route path="*" component={Page404} />
            </Switch>

            {totalProducts >= 8 && (
              <div className="d-flex justify-content-center text-center mt-4">
                <Pagination
                  handlePagenationChangeSubmit={filterProducts}
                  products={products}
                  pages={pages}
                  page={pageNumber}
                />
              </div>
            )}
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    advancedFilters: state.product.advancedFilters,
  };
};

export default connect(mapStateToProps, actions)(Shop);
