import React, { Component } from 'react'
import { Menu } from 'semantic-ui-react'

import Channels from './Channels'
import DirectMessages from './DirectMessages'
import Starred from './Starred'
import UserPanel from './UserPanel'

class SidePanel extends Component {
  state = {
    isDirectMessageActive: false,
    isChannelActive: true,
    isStarredActive: false
  }

  isChannelActive = channelId => {
    return this.props.currentChannel.id === channelId
  }

  activateDirectMessages = () => {
    this.setState({
      isDirectMessageActive: true,
      isChannelActive: false,
      isStarredActive: false
    })
  }

  activateChannels = () => {
    this.setState({
      isDirectMessageActive: false,
      isChannelActive: true,
      isStarredActive: false
    })
  }

  activateStarred = () => {
    this.setState({
      isDirectMessageActive: false,
      isChannelActive: false,
      isStarredActive: true
    })
  }

  render() {
    const { currentUser, primaryColor } = this.props
    return (
      <Menu
        size="large"
        inverted
        fixed="left"
        vertical
        style={{ background: primaryColor, fontSize: '1.2rem' }}
      >
        <UserPanel primaryColor={primaryColor} currentUser={currentUser} />
        <Starred
          currentUser={currentUser}
          activateStarred={this.activateStarred}
          canBeActive={this.state.isStarredActive}
        />
        <Channels
          currentUser={currentUser}
          activateChannels={this.activateChannels}
          canBeActive={this.state.isChannelActive}
        />
        <DirectMessages
          currentUser={currentUser}
          isChannelActive={this.isChannelActive}
          activateDirectMessages={this.activateDirectMessages}
          canBeActive={this.state.isDirectMessageActive}
        />
      </Menu>
    )
  }
}

export default SidePanel
