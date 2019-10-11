import React, { Component } from 'react'
import { Comment, Image } from 'semantic-ui-react'
import moment from 'moment'

import firebase from '../../firebase'

export default class Message extends Component {
  state = {
    message: this.props.message,
    user: this.props.user,
    avatarUrl: '',
    unmounted: false
  }

  componentDidMount() {
    if (!this.state.unmounted) {
      firebase
        .database()
        .ref(`users/${this.state.message.user.id}`)
        .on('value', snapshot => {
          this.setState({ avatarUrl: snapshot.val().avatar })
        })
    }
  }

  componentWillUnmount() {
    this.setState({ unmounted: true })
    firebase
      .database()
      .ref(`users/${this.state.message.user.id}`)
      .off()
  }

  isOwnMessage = (message, user) => {
    if (!this.state.unmounted) {
      return message.user.id === user.uid ? 'message__self' : ''
    }
  }

  isImage = message => {
    if (!this.state.unmounted) {
      return (
        message.hasOwnProperty('image') && !message.hasOwnProperty('content')
      )
    }
  }

  timeFromNow = timestamp => moment(timestamp).fromNow()

  render() {
    const { message, user, avatarUrl } = this.state
    if (!this.state.unmounted)
      return (
        <Comment>
          <Comment.Avatar src={avatarUrl} />
          <Comment.Content className={this.isOwnMessage(message, user)}>
            <Comment.Author as="a">{message.user.name}</Comment.Author>
            <Comment.Metadata>
              {this.timeFromNow(message.timestamp)}
            </Comment.Metadata>
            {this.isImage(message) ? (
              <Image src={message.image} className="message__image" />
            ) : (
              <Comment.Text>{message.content}</Comment.Text>
            )}
          </Comment.Content>
        </Comment>
      )
  }
}
