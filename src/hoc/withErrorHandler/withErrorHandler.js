import React, {Component} from 'react'; 
import Modal from '../../components/UI/Modal/Modal';
import Aux from  '../Auxiliary/Auxiliary';  


const withErrorHandler = (WrapperComponent, axios) => {
    return class extends Component {
        state = {
            error:null 
        }

        componentWillMount () {
            this.reqInterceptor =  axios.interceptors.request.use(req => {
                this.setState({error: null}); //clear the errors 
                return req;
            })
            this.resInterceptor = axios.interceptors.response.use(res => res, error => {
                this.setState({error: error})
                
            });
        }

        componentWillUnmount() { //lifecycle method when component is not required anymore 
                axios.interceptors.request.eject(this.reqInterceptor); //removing the interceptors 
                axios.interceptors.request.eject(this.resInterceptor); //removing the interceptors 

        }

        errorConfirmedHandler = () => {
            this.setState({error: null})
        }
        render() {
            return (

            <Aux>
                <Modal show={this.state.error}
                clicked={this.errorConfirmedHandler}> 
                    {this.state.error ? this.state.error.message : null}
                </Modal>
            <WrapperComponent {...this.props} /> 
            </Aux>
                
            )
        }
    }
}

export default withErrorHandler; 