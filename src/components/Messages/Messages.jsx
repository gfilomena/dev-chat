import React, { Component } from 'react'
import { Comment, Segment } from 'semantic-ui-react'

import firebase from '../../firebase'
import Message from './Message'
import MessageForm from './MessageForm'
import MessagesHeader from './MessagesHeader'
import Skeleton from './Skeleton'
import Typing from './Typing'

class Messages extends Component {
  state = {
    privateChannel: this.props.isPrivateChannel,
    privateMessagesRef: firebase.database().ref('privateMessages'),
    messagesRef: firebase.database().ref('messages'),
    channel: this.props.currentChannel,
    isChannelStarred: false,
    user: this.props.currentUser,
    usersRef: firebase.database().ref('users'),
    messages: [],
    messagesLoading: true,
    progressBar: false,
    numUniqueUsers: '',
    searchTerm: '',
    searchLoading: false,
    searchResults: [],
    typingRef: firebase.database().ref('typing'),
    typingUsers: [],
    connectedRef: firebase.database().ref('.info/connected'),
    listeners: [],
    unmounted: false
  }

  componentDidMount() {
    const { channel, user, listeners } = this.state
    this.setState({ unmounted: false })
    if (channel && user) {
      this.removeListeners(listeners)
      this.addListeners(channel.id)
      this.addUserStarsListener(channel.id, user.uid)
    }
  }

  componentWillUnmount() {
    this.setState({ unmounted: true })
    this.removeListeners(this.state.listeners)
    this.state.connectedRef.off()
  }

  removeListeners = listeners => {
    if (!this.state.unmounted) {
      listeners.forEach(listener => {
        listener.ref.child(listener.id).off(listener.event)
      })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.unmounted) {
      if (this.messagesEnd) {
        this.scrollToBottom()
      }
    }
  }

  addToListeners = (id, ref, event) => {
    if (!this.state.unmounted) {
      const index = this.state.listeners.findIndex(listener => {
        return (
          listener.id === id && listener.ref === ref && listener.event === event
        )
      })

      if (index === -1) {
        const newListener = { id, ref, event }
        this.setState({ listeners: this.state.listeners.concat(newListener) })
      }
    }
  }

  scrollToBottom = () => {
    if (!this.state.unmounted) {
      this.messagesEnd.scrollIntoView({ behavior: 'smooth' })
    }
  }

  addListeners = channelId => {
    if (!this.state.unmounted) {
      this.addMessageListener(channelId)
      this.addTypingListeners(channelId)
    }
  }

  addTypingListeners = channelId => {
    if (!this.state.unmounted) {
      let typingUsers = []
      this.state.typingRef.child(channelId).on('child_added', snap => {
        if (snap.key !== this.state.user.uid) {
          typingUsers = typingUsers.concat({
            id: snap.key,
            name: snap.val()
          })
          this.setState({ typingUsers })
        }
      })

      this.addToListeners(channelId, this.state.typingRef, 'child_added')

      this.state.typingRef.child(channelId).on('child_removed', snap => {
        const index = typingUsers.findIndex(user => user.id === snap.key)
        if (index !== -1) {
          typingUsers = typingUsers.filter(user => user.id !== snap.key)
          this.setState({ typingUsers })
        }
      })

      this.addToListeners(channelId, this.state.typingRef, 'child_removed')

      this.state.connectedRef.on('value', snap => {
        if (snap.val() === true) {
          this.state.typingRef
            .child(channelId)
            .child(this.state.user.uid)
            .onDisconnect()
            .remove(error => {
              if (error !== null) {
                console.error(error)
              }
            })
        }
      })
    }
  }

  addMessageListener = channelId => {
    if (!this.state.unmounted) {
      let loadedMessages = []
      const ref = this.getMessagesRef()
      ref.child(channelId).on('child_added', snap => {
        loadedMessages.push(snap.val())
        this.setState({
          messages: loadedMessages,
          messagesLoading: false
        })
        this.countUniqueUsers(loadedMessages)
      })
      this.setState({
        messagesLoading: false
      })
      this.addToListeners(channelId, ref, 'child_added')
    }
  }

  addUserStarsListener = (channelId, userId) => {
    if (!this.state.unmounted) {
      this.state.usersRef
        .child(userId)
        .child('starred')
        .once('value')
        .then(data => {
          if (data.val() !== null) {
            const channelIds = Object.keys(data.val())
            const prevStarred = channelIds.includes(channelId)
            this.setState({ isChannelStarred: prevStarred })
          }
        })
    }
  }

  getMessagesRef = () => {
    if (!this.state.unmounted) {
      const { messagesRef, privateMessagesRef, privateChannel } = this.state
      return privateChannel ? privateMessagesRef : messagesRef
    }
  }

  handleStar = () => {
    if (!this.state.unmounted) {
      this.setState(
        prevState => ({
          isChannelStarred: !prevState.isChannelStarred
        }),
        () => this.starChannel()
      )
    }
  }

  starChannel = () => {
    if (!this.state.unmounted) {
      if (this.state.isChannelStarred) {
        this.state.usersRef.child(`${this.state.user.uid}/starred`).update({
          [this.state.channel.id]: {
            name: this.state.channel.name,
            details: this.state.channel.details,
            createdBy: {
              name: this.state.channel.createdBy.name,
              id: this.state.channel.createdBy.id
            }
          }
        })
      } else {
        this.state.usersRef
          .child(`${this.state.user.uid}/starred`)
          .child(this.state.channel.id)
          .remove(error => {
            if (error !== null) {
              console.error(error)
            }
          })
      }
    }
  }

  handleSearchChange = e => {
    if (!this.state.unmounted) {
      this.setState(
        {
          searchTerm: e.target.value,
          searchLoading: true
        },
        () => this.handleSearchMessages()
      )
    }
  }

  handleSearchMessages = () => {
    if (!this.state.unmounted) {
      const channelMessages = [...this.state.messages]
      const regex = new RegExp(this.state.searchTerm, 'gi')
      const searchResults = channelMessages.reduce((acc, message) => {
        if (
          (message.content && message.content.match(regex)) ||
          message.user.name.match(regex)
        ) {
          acc.push(message)
        }
        return acc
      }, [])
      this.setState({ searchResults })
      setTimeout(() => this.setState({ searchLoading: false }), 800)
    }
  }

  countUniqueUsers = messages => {
    if (!this.state.unmounted) {
      const uniqueUsers = messages.reduce((acc, message) => {
        if (!acc.includes(message.user.name)) {
          acc.push(message.user.name)
        }
        return acc
      }, [])
      const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0
      const numUniqueUsers = `${uniqueUsers.length} user${plural ? 's' : ''}`
      this.setState({ numUniqueUsers })
    }
  }

  displayMessages = messages =>
    messages.length > 0 &&
    !this.state.unmounted &&
    messages.map(message => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ))

  isProgressBarVisible = uploadState => {
    if (!this.state.unmounted) {
      if (uploadState === 'uploading') {
        this.setState({ progressBar: true })
      } else {
        this.setState({ progressBar: false })
      }
    }
  }

  displayChannelName = channel => {
    return channel
      ? `${this.state.privateChannel ? '@' : '#'}${channel.name}`
      : ''
  }

  displayTypingUsers = users =>
    users.length > 0 &&
    !this.state.unmounted &&
    users.map(user => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '0.2em'
        }}
        key={user.id}
      >
        <span className="user__typing">{user.name} is typing</span>
        <Typing />
      </div>
    ))

  displayMessageSkeleton = loading =>
    loading ? (
      <React.Fragment>
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </React.Fragment>
    ) : null

  render() {
    const {
      messagesRef,
      messages,
      channel,
      user,
      progressBar,
      numUniqueUsers,
      searchTerm,
      searchResults,
      searchLoading,
      privateChannel,
      isChannelStarred,
      typingUsers,
      messagesLoading
    } = this.state
    return (
      <React.Fragment>
        <MessagesHeader
          channelName={this.displayChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={privateChannel}
          handleStar={this.handleStar}
          isChannelStarred={isChannelStarred}
        />
        <Segment>
          <Comment.Group
            className={progressBar ? 'messages__progress' : 'messages'}
            style={{ maxWidth: '100%' }}
          >
            {this.displayMessageSkeleton(messagesLoading)}
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
            {this.displayTypingUsers(typingUsers)}
            <div ref={node => (this.messagesEnd = node)} />
          </Comment.Group>
        </Segment>
        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isProgressBarVisible={this.isProgressBarVisible}
          isPrivateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
          progressBar={progressBar}
        />
      </React.Fragment>
    )
  }
}

export default Messages
