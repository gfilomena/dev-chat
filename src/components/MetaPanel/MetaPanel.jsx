import React, { Component } from 'react'
import { Accordion, Header, Icon, Image, Segment } from 'semantic-ui-react'

import firebase from '../../firebase'

class MetaPanel extends Component {
  state = {
    channel: this.props.currentChannel,
    privateChannel: this.props.isPrivateChannel,
    activeIndex: 0,
    createdByAvatarUrl: '',
    topPostersAvatarUrls: {}
  }

  componentDidMount() {
    if (this.state.channel && !this.state.privateChannel) {
      firebase
        .database()
        .ref(`users/${this.state.channel.createdBy.id}`)
        .on('value', snapshot => {
          this.setState({ createdByAvatarUrl: snapshot.val().avatar })
        })
    }
  }

  setActiveIndex = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index
    this.setState({ activeIndex: newIndex })
  }

  formatCount = num => (num > 1 || num === 0 ? `${num} posts` : `${num} post`)

  render() {
    const {
      activeIndex,
      privateChannel,
      channel,
      createdByAvatarUrl
    } = this.state

    if (privateChannel) return null

    return (
      <Segment loading={!channel}>
        <Header as="h3" attached="top" className="text__to__wrap-2">
          About # {channel && channel.name}
        </Header>
        <Accordion styled attached="true">
          <Accordion.Title
            active={activeIndex === 0}
            index={0}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="info" />
            Channel Details
          </Accordion.Title>
          <Accordion.Content
            active={activeIndex === 0}
            className="text__to__wrap-2"
          >
            {channel && channel.details}
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 2}
            index={2}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="pencil alternate" />
            Created By
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
            <Header as="h3">
              <Image circular src={createdByAvatarUrl} />
              {channel && channel.createdBy.name}
            </Header>
          </Accordion.Content>
        </Accordion>
      </Segment>
    )
  }
}

export default MetaPanel
