import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Button,
  Form,
  Icon,
  Input,
  Menu,
  Label,
  Modal
} from 'semantic-ui-react'

import firebase from '../../firebase'
import { setCurrentChannel, setPrivateChannel } from '../../actions/index'

class Channels extends Component {
  state = {
    activeChannel: '',
    user: this.props.currentUser,
    channel: null,
    channels: [],
    channelName: '',
    channelDetails: '',
    channelsRef: firebase.database().ref('channels'),
    messagesRef: firebase.database().ref('messages'),
    typingRef: firebase.database().ref('typing'),
    notifications: [],
    modal: false,
    deleteModal: false,
    firstLoad: true,
    channelToDelete: ''
  }

  componentDidMount() {
    this.addListeners()
  }

  componentWillUnmount() {
    this.removeListeners()
  }

  addListeners = () => {
    let loadedChannels = []
    this.state.channelsRef.on('child_added', snap => {
      loadedChannels.push(snap.val())
      this.setState({ channels: loadedChannels }, () => this.setFirstChannel())
      this.addNotificationListener(snap.key)
    })

    this.state.channelsRef.on('child_removed', snap => {
      const channelToRemove = snap.val()
      const newChannels = loadedChannels.filter(
        channel => channel.id !== channelToRemove.id
      )
      this.setState({ channels: newChannels, firstLoad: true }, () =>
        this.setFirstChannel()
      )
    })
  }

  addNotificationListener = channelId => {
    this.state.messagesRef.child(channelId).on('value', snap => {
      if (this.state.channel) {
        this.handleNotifications(
          channelId,
          this.state.channel.id,
          this.state.notifications,
          snap
        )
      }
    })
  }

  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0
    let index = notifications.findIndex(
      notification => notification.id === channelId
    )
    if (index !== -1) {
      if (channelId !== currentChannelId) {
        lastTotal = notifications[index].total
        if (snap.numChildren() - lastTotal > 0) {
          notifications[index].count = snap.numChildren() - lastTotal
        }
      }
      notifications[index].lastKnownTotal = snap.numChildren()
    } else {
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0
      })
    }
    this.setState({ notifications })
  }

  removeListeners = () => {
    this.state.channelsRef.off()
    this.state.channels.forEach(channel => {
      this.state.messagesRef.child(channel.id).off()
    })
  }

  setFirstChannel = () => {
    if (this.state.firstLoad && this.state.channels.length > 0) {
      const firstChannel = this.state.channels[0]
      this.props.setCurrentChannel(firstChannel)
      this.setActiveChannel(firstChannel)
      this.setState({ channel: firstChannel })
    }
    this.setState({ firstLoad: false })
  }

  addChannel = () => {
    const { channelsRef, channelName, channelDetails, user } = this.state
    const key = channelsRef.push().key
    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: user.displayName,
        id: user.uid
      }
    }
    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({ channelName: '', channelDetails: '' })
        this.closeModal()
      })
      .catch(error => console.error(error))
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  changeChannel = channel => {
    this.setActiveChannel(channel)
    this.state.typingRef
      .child(this.state.channel.id)
      .child(this.state.user.uid)
      .remove()
    this.clearNotifications()
    this.props.setCurrentChannel(channel)
    this.props.setPrivateChannel(false)

    this.props.activateChannels()

    this.setState({ channel })
  }

  deleteChannel = channelId => {
    firebase
      .database()
      .ref('channels')
      .child(`${channelId}`)
      .remove()

    firebase
      .database()
      .ref('messages')
      .child(`${channelId}`)
      .remove()

    this.setState({ channelToDelete: '' })
    this.closeDeleteModal()
  }

  handleDeleteChannel = channelId => {
    this.setState({ channelToDelete: channelId })
    this.openDeleteModal()
  }

  clearNotifications = () => {
    let index = this.state.notifications.findIndex(
      notification => notification.id === this.state.channel.id
    )
    if (index !== -1) {
      let updatedNotifications = [...this.state.notifications]
      updatedNotifications[index].total = this.state.notifications[
        index
      ].lastKnownTotal
      updatedNotifications[index].count = 0
      this.setState({ notifications: updatedNotifications })
    }
  }

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id })
  }

  handleSubmit = e => {
    e.preventDefault()
    if (this.isFormValid(this.state)) {
      this.addChannel()
    }
  }

  isFormValid = ({ channelName, channelDetails }) =>
    channelName && channelDetails

  getNotificationCount = channel => {
    let count = 0

    this.state.notifications.forEach(notification => {
      if (notification.id === channel.id) {
        count = notification.count
      }
    })

    if (count > 0) return count
  }

  displayChannels = channels =>
    channels.length > 0 &&
    channels.map(channel => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel)}
        name={channel.name}
        style={{ opacity: 0.7 }}
        active={
          this.props.canBeActive
            ? channel.id === this.state.activeChannel
            : false
        }
        className="text__to__wrap"
      >
        # {channel.name}
        {channel && channel.createdBy.id === this.props.currentUser.uid ? (
          <Icon
            name="delete"
            onClick={() => this.handleDeleteChannel(channel.id)}
          />
        ) : null}
        {this.getNotificationCount(channel) && (
          <Label color="red">{this.getNotificationCount(channel)}</Label>
        )}
      </Menu.Item>
    ))

  openModal = () => {
    this.setState({ modal: true })
  }

  closeModal = () => {
    this.setState({ modal: false })
  }

  openDeleteModal = () => {
    this.setState({ deleteModal: true })
  }

  closeDeleteModal = () => {
    this.setState({ deleteModal: false, channelToDelete: '' })
  }

  render() {
    const { channels, modal, deleteModal, channelToDelete } = this.state
    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="exchange" /> Channels
            </span>{' '}
            ({channels.length}){' '}
            <Icon
              name="add"
              onClick={this.openModal}
              style={{ cursor: 'pointer' }}
            />
          </Menu.Item>
          {this.displayChannels(channels)}
        </Menu.Menu>

        <Modal open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of Channel"
                  name="channelName"
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  label="About the Channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" /> Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>

        <Modal open={deleteModal} onClose={this.closeDeleteModal}>
          <Modal.Header>
            Are you sure you want to delete this channel?
          </Modal.Header>
          <Modal.Actions>
            <Button
              color="green"
              inverted
              onClick={() => this.deleteChannel(channelToDelete)}
            >
              <Icon name="checkmark" /> Delete
            </Button>
            <Button color="red" inverted onClick={this.closeDeleteModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    )
  }
}

export default connect(
  null,
  { setCurrentChannel, setPrivateChannel }
)(Channels)
