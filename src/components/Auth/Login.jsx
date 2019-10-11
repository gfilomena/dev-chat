import React, { Component } from 'react'
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon
} from 'semantic-ui-react'
import { Link } from 'react-router-dom'

import firebase from '../../firebase'

class Login extends Component {
  state = {
    email: '',
    password: '',
    errors: [],
    loading: false
  }

  displayErrors = errors =>
    errors.map((error, i) => <p key={i}>{error.message}</p>)

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleSubmit = e => {
    e.preventDefault()
    if (this.isFormValid()) {
      this.setState({ errors: [], loading: true })
      firebase
        .auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password)
        .catch(error => {
          console.error(error)
          this.setState({
            errors: this.state.errors.concat(error),
            loading: false
          })
        })
    }
  }

  isFormValid = ({ email, password } = this.state) => email && password

  handleInputError = (errors, inputName) => {
    return errors.some(error => error.message.toLowerCase().includes(inputName))
      ? 'error'
      : ''
  }

  render() {
    const { email, password, errors, loading } = this.state
    return (
      <div>
        <Grid textAlign="center" verticalAlign="middle" className="app">
          <Grid.Column style={{ maxWidth: 450 }}>
            <Header as="h1" icon color="violet" textAlign="center">
              <Icon name="code branch" color="violet" />
              Login to DevChat
            </Header>
            <Form size="large" onSubmit={this.handleSubmit}>
              <Segment stacked>
                <Form.Input
                  fluid
                  name="email"
                  icon="mail"
                  iconPosition="left"
                  placeholder="Email Address"
                  type="email"
                  onChange={this.handleChange}
                  className={this.handleInputError(errors, 'email')}
                  value={email}
                />
                <Form.Input
                  fluid
                  name="password"
                  icon="lock"
                  iconPosition="left"
                  placeholder="Password"
                  type="password"
                  onChange={this.handleChange}
                  className={this.handleInputError(errors, 'password')}
                  value={password}
                />
                <Button
                  disabled={loading}
                  className={loading ? 'loading' : ''}
                  color="violet"
                  fluid
                  size="large"
                >
                  Submit
                </Button>
              </Segment>
            </Form>
            {errors.length > 0 && (
              <Message error>{this.displayErrors(errors)}</Message>
            )}
            <Message>
              Don't have an account? <Link to="/register">Register</Link>
            </Message>
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}

export default Login
