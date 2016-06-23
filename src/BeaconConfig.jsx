import React, { PropTypes } from 'react';

export default class BeaconConfig extends React.Component {
  static propTypes = {
    position: PropTypes.string,
    persistent: PropTypes.bool,
    indexedDB: PropTypes.object,
    children: PropTypes.node
  }

  static childContextTypes = {
    beacon: PropTypes.object
  }

  static defaultProps = {
    position: 'right',
    persistent: false,
    indexedDB: indexedDB
  }

  getChildContext() {
    const { position, persistent, indexedDB } = this.props;
    return { beacon: { position, persistent, indexedDB }};
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}
