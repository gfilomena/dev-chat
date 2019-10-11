import React, { Component } from 'react'
import { Header, Icon, Input, Segment } from 'semantic-ui-react'

class MessagesHeader extends Component {
  render() {
    const {
      channelName,
      numUniqueUsers,
      handleSearchChange,
      searchLoading,
      isPrivateChannel,
      handleStar,
      isChannelStarred
    } = this.props
    return (
      <Segment
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Header as="h3" style={{ marginBottom: 0 }} className="channel__name">
          <span style={{ display: 'flex' }}>
            {!isPrivateChannel && (
              <Icon
                name={isChannelStarred ? 'star' : 'star outline'}
                color={isChannelStarred ? 'yellow' : 'black'}
                onClick={handleStar}
                style={{ marginRight: '5px', cursor: 'pointer' }}
              />
            )}
            <p
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {channelName}
            </p>
          </span>
          <Header.Subheader>{numUniqueUsers}</Header.Subheader>
        </Header>
        <Input
          loading={searchLoading}
          size="mini"
          icon="search"
          name="searchTerm"
          placeholder="Search Messages"
          onChange={handleSearchChange}
          style={{ fontSize: '12.5px' }}
        />
      </Segment>
    )
  }
}

export default MessagesHeader
