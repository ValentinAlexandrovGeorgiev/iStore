import React, { Component } from 'react';
import { Link } from 'react-router';
import ajax from 'superagent';
import BasketTile from './BasketTile';
import SERVER_URL from '../config';
import '../css/basket.css';

class BasketGrid extends Component {

    constructor(props) {
        super(props);
        this.state = {
            added_products: []
        };
        this.getBasketProducts = this.getBasketProducts.bind(this);
        this.updateBasketProducts = this.updateBasketProducts.bind(this);
    }

    getBasketProducts() {
        let currentUser = window.localStorage.getItem("profile-id");
        ajax.get(SERVER_URL + '/basket/' + currentUser)
            .end((err, res) => {
                if(!err && res) {
                    let products = JSON.parse(res.text);
                    let to_be_ordered = products.filter( product => !product.ordered_by_current_user );
                    this.setState({
                         added_products: to_be_ordered
                    });
                }
                else {
                    this.setState({
                        added_products: []
                    });
                }
            })
    }

    componentDidMount(){
        this.getBasketProducts();
    }

    updateBasketProducts(updated_products) {
        this.setState({
            added_products: updated_products
        });
    }

    render() {
        let products = this.state.added_products;
        const basket_products = products ? products.map(product => {
            return (<BasketTile key={product._id} basket_id={product._id} product={product.product} quantity={product.quantity} refresh_prs={this.updateBasketProducts}/>);
        }) : (<div>Sorry</div>);

        return (
            <div className="row basket-wrapper">
                <div className="col-xs-12">
                    <h2 className="basket-title">BASKET</h2>
                </div>
                {basket_products}
                <div className="col-xs-12 basket-checkout">
                    {(products !== []) ? (<Link to='/order'>
                        <button className="checkout-button">
                            Checkout
                        </button>
                    </Link>) : null }
                </div>
            </div>
        );
    }
}

export default BasketGrid;
