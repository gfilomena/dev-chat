import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter
} from 'react-router-dom'
import { createStore } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { connect, Provider } from 'react-redux'

import App from './components/App'
import firebase from './firebase'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import registerServiceWorker from './registerServiceWorker'
import rootReducer from './reducers'
import { setUser, clearUser } from './actions'
import Spinner from './Spinner'
import 'semantic-ui-css/semantic.min.css'

const store = createStore(rootReducer, composeWithDevTools())

class Root extends Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.props.setUser(user)
        this.props.history.push('/')
      } else {
        this.props.history.push('/login')
        this.props.clearUser()
      }
    })
  }

  render() {
    return this.props.isLoading ? (
      <Spinner />
    ) : (
      <Switch>
        <Route exact path="/" component={App} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
      </Switch>
    )
  }
}

const mapStateToProps = state => ({
  isLoading: state.user.isLoading
})

const RootwithAuth = withRouter(
  connect(
    mapStateToProps,
    { setUser, clearUser }
  )(Root)
)

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <RootwithAuth />
    </Router>
  </Provider>,
  document.getElementById('root')
)
registerServiceWorker()
