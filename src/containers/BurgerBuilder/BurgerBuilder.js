import React, { Component } from 'react';

import Aux from '../../hoc/Auxiliary/Auxiliary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary'; 
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import axios from '../../axios-orders';


const INGREDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.4,
    meat: 1.3,
    bacon: 0.7
};

class BurgerBuilder extends Component {
    state = {
        ingredients: null,
        totalPrice: 4,
        purchasable: false,
        purchasing: false,
        loading: false,
        error: false 

    }

    componentDidMount () { //retriving the ingredients list from Firebase 
        axios.get('https://react-my-burger-4b17c.firebaseio.com/ingredients.json')
            .then(response => {
                this.setState({ingredients: response.data});
            })
            .catch (error => {
                this.setState({error: true})

            });
    }

    updatePurchaseState (ingredients) {

        const sum = Object.keys(ingredients)
                .map(igKey => {
                    return ingredients[igKey]
                })
                .reduce ((sum, el) => { 
                    return sum + el; 
                }, 0);   
        this.setState({purchasable: sum >0});
         
    }

    addIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        const updatedCount = oldCount + 1; 
        const updatedIngredients = {
            ...this.state.ingredients 
        };
        updatedIngredients[type] = updatedCount;
        const priceAddition = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice + priceAddition; 
        this.setState({totalPrice: newPrice, ingredients: updatedIngredients}); //updating the state when a new ingredient is added 
        this.updatePurchaseState(updatedIngredients);
    }

    removeIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        if (oldCount <= 0 ) { //if there is no indgredients to remove, just do nothing 
            return;
        }
        const updatedCount = oldCount - 1; 
        const updatedIngredients = {
            ...this.state.ingredients 
        };
        updatedIngredients[type] = updatedCount;
        const priceDeduction = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice - priceDeduction; 
        this.setState({totalPrice: newPrice, ingredients: updatedIngredients}); //updating the state when a new ingredient is added 
        this.updatePurchaseState(updatedIngredients);

    }

    purchaseHandler = () => {
        this.setState({purchasing: true })
    }

    purchaseCancelHandler = () => {
        this.setState({purchasing: false})
    }

    purchaseContinueHandler = () => {
        // alert('You continue!');   
        this.setState({loading: true});

        const order = {
            ingredients: this.state.ingredients,
            price: this.state.totalPrice,
            customer: {
                name: 'Max Customer',
                address: {
                    street: 'Test Street',
                    zipcode: '343234',
                    country: 'Sweden'
                },
                email: 'test@test.com'
            },
            deliveryMethod: 'Rush'
        }

        axios.post('/orders.json', order)  //endpoint in Firebase, 2nd Argument - order is passed 
            .then(response => {
                this.setState({ loading: false, purchasing: false }); //hides the loading spinner and modal
            })
            .catch(error => {
                this.setState({loading: false, purchasing: false }); 
            })
    }

    render () {
        const disabledInfo = {
            ...this.state.ingredients
        };

        for (let key in disabledInfo) {
            disabledInfo[key] = disabledInfo[key] <= 0 
        }

        let orderSummary = null;
        let burger = this.state.error ?  <p>ingredients can't be loaded </p> : <Spinner/>//if this.state.error is true then alert users 
        if (this.state.ingredients) {  //if state ingredients is not null 
            burger =  (
                <Aux>
                <Burger ingredients={this.state.ingredients} /> 
                <BuildControls 
                ingredientAdded={this.addIngredientHandler}
                ingredientRemoved={this.removeIngredientHandler}
                disabled={disabledInfo}
                purchasable={this.state.purchasable}
                price={this.state.totalPrice}
                ordered={this.purchaseHandler}/> 
                </Aux>
                ); 

                orderSummary = <OrderSummary 
                ingredients={this.state.ingredients} 
                price={this.state.totalPrice}
                purchaseCanceled={this.purchaseCancelHandler}
                purchaseContinued={this.purchaseContinueHandler}
                                    /> ;
        }

        if (this.state.loading) { //load the CSS Spinner is this loading = true
            orderSummary = <Spinner /> 
        }
      
        return (
            <Aux>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal> 
            {burger}
               
            </Aux>


        ); 
    }

}

export default withErrorHandler(BurgerBuilder, axios); 