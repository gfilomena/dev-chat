import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Button,
  Divider,
  Header,
  Icon,
  Label,
  Menu,
  Modal,
  Segment,
  Sidebar
} from 'semantic-ui-react'
import { HuePicker } from 'react-color'

import { setColors } from '../../actions'

import firebase from '../../firebase'

class ColorPanel extends Component {
  state = {
    modal: false,
    primary: '',
    secondary: '',
    showWarningPrimary: false,
    showWarningSecondary: false,
    user: this.props.currentUser,
    userColors: [],
    usersRef: firebase.database().ref('users')
  }

  componentDidMount() {
    if (this.state.user) {
      this.addListener(this.state.user.uid)
    }
  }

  componentWillUnmount() {
    this.removeListener()
  }

  removeListener = () => {
    this.state.usersRef.child(`${this.state.user.uid}/colors`).off()
  }

  addListener = userId => {
    let userColors = []
    this.state.usersRef.child(`${userId}/colors`).on('child_added', snap => {
      userColors.unshift(snap.val())
      this.setState({ userColors })
    })
  }

  handleChangePrimary = color => this.setState({ primary: color.hex })

  handleChangeSecondary = color => this.setState({ secondary: color.hex })

  handleSaveColors = () => {
    const { primary, secondary } = this.state

    if (primary && secondary) {
      this.saveColors(this.state.primary, this.state.secondary)
      this.setState({
        showWarningPrimary: false,
        showWarningSecondary: false,
        primary: '',
        secondary: ''
      })
    }

    if (primary) {
      this.setState({ showWarningPrimary: false })
    } else {
      this.setState({ showWarningPrimary: true })
    }

    if (secondary) {
      this.setState({ showWarningSecondary: false })
    } else {
      this.setState({ showWarningSecondary: true })
    }
  }

  saveColors = (primary, secondary) => {
    this.state.usersRef
      .child(`${this.state.user.uid}/colors`)
      .push()
      .update({
        primary,
        secondary
      })
      .then(() => {
        this.closeModal()
      })
      .catch(error => {
        console.error(error)
      })
  }

  displayUserColors = colors =>
    colors.length > 0 &&
    colors.map((color, i) => (
      <React.Fragment key={i}>
        <Divider />
        <div
          className="color__container"
          onClick={() => this.props.setColors(color.primary, color.secondary)}
        >
          <div className="color__square" style={{ background: color.primary }}>
            <div
              className="color__overlay"
              style={{ background: color.secondary }}
            />
          </div>
        </div>
      </React.Fragment>
    ))

  openModal = () => this.setState({ modal: true })

  closeModal = () => this.setState({ modal: false })

  render() {
    const {
      modal,
      primary,
      secondary,
      userColors,
      showWarningPrimary,
      showWarningSecondary
    } = this.state

    return (
      <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width="very thin"
      >
        <Divider />
        <Button icon="add" size="small" color="blue" onClick={this.openModal} />
        {this.displayUserColors(userColors)}
        <Modal open={modal} onClose={this.closeModal}>
          <Modal.Header>Adding New App Colors</Modal.Header>
          <Header as="h4">
            Select 2 colors to create a new app color scheme. After submitting,
            click on it on your sidebar and it will change app colors.
          </Header>
          <Modal.Content>
            <Segment>
              <Label content="Primary Color" className="mb-2" />
              {showWarningPrimary ? (
                <Label color="red" pointing="left">
                  Select a shade of the color
                </Label>
              ) : null}
              <HuePicker
                width="100%"
                color={primary}
                onChange={this.handleChangePrimary}
              />
            </Segment>
            <Segment>
              <Label content="Secondary Color" className="mb-2" />
              {showWarningSecondary ? (
                <Label color="red" pointing="left">
                  Select a shade of the color
                </Label>
              ) : null}
              <HuePicker
                width="100%"
                color={secondary}
                onChange={this.handleChangeSecondary}
              />
            </Segment>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSaveColors}>
              <Icon name="checkmark" /> Save Colors
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    )
  }
}

export default connect(
  null,
  { setColors }
)(ColorPanel)
