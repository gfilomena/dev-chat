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
import md5 from 'md5'

import firebase from '../../firebase'

class Register extends Component {
  state = {
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    errors: [],
    loading: false,
    usersRef: firebase.database().ref('users')
  }

  isFormValid = () => {
    let errors = []
    let customError
    if (this.isFormEmpty(this.state)) {
      customError = { message: 'Fill in all fields' }
      this.setState({ errors: errors.concat(customError) })
      return false
    } else if (!this.isPasswordValid(this.state)) {
      customError = { message: 'Password is not valid' }
      this.setState({ errors: errors.concat(customError) })
      return false
    } else {
      return true
    }
  }

  isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !passwordConfirmation.length
    )
  }

  isPasswordValid = ({ password, passwordConfirmation }) => {
    if (password.length < 6 || passwordConfirmation.length < 6) {
      return false
    } else if (password !== passwordConfirmation) {
      return false
    } else {
      return true
    }
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
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(createdUser => {
          createdUser.user
            .updateProfile({
              displayName: this.state.username,
              photoURL: `http://gravatar.com/avatar/${md5(
                createdUser.user.email
              )}?d=identicon`
            })
            .then(() => {
              this.saveUser(createdUser)
            })
            .catch(error => {
              console.error(error)
              this.setState({
                errors: this.state.errors.concat(error),
                loading: false
              })
            })
        })
        .catch(error => {
          console.error(error)
          this.setState({
            errors: this.state.errors.concat(error),
            loading: false
          })
        })
    }
  }

  handleInputError = (errors, inputName) => {
    return errors.some(error => error.message.toLowerCase().includes(inputName))
      ? 'error'
      : ''
  }

  saveUser = createdUser => {
    return this.state.usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL
    })
  }

  render() {
    const {
      username,
      email,
      password,
      passwordConfirmation,
      errors,
      loading
    } = this.state
    return (
      <div>
        <Grid textAlign="center" verticalAlign="middle" className="app">
          <Grid.Column style={{ maxWidth: 450 }}>
            <Header as="h1" icon color="orange" textAlign="center">
              <Icon name="puzzle piece" color="orange" />
              Register for DevChat
            </Header>
            <Form size="large" onSubmit={this.handleSubmit}>
              <Segment stacked>
                <Form.Input
                  fluid
                  name="username"
                  icon="user"
                  iconPosition="left"
                  placeholder="Username"
                  type="text"
                  onChange={this.handleChange}
                  className={this.handleInputError(errors, 'username')}
                  value={username}
                />
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
                <Form.Input
                  fluid
                  name="passwordConfirmation"
                  icon="repeat"
                  iconPosition="left"
                  placeholder="Password Confirmation"
                  type="password"
                  onChange={this.handleChange}
                  className={this.handleInputError(errors, 'password')}
                  value={passwordConfirmation}
                />
                <Button
                  disabled={loading}
                  className={loading ? 'loading' : ''}
                  color="orange"
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
              Already a user? <Link to="/login">Login</Link>
            </Message>
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}

export default Register
