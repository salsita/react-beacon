import React, { Component, PropTypes } from 'react';

export default class BeaconConfig extends Component {
  static propTypes = {
    persistent: PropTypes.bool,
    indexedDB: PropTypes.object,
    children: PropTypes.node.isRequired
  }

  static childContextTypes = {
    beacon: PropTypes.object
  }

  static defaultProps = {
    persistent: false,
    indexedDB: indexedDB
  }

  getChildContext() {
    const { persistent, indexedDB } = this.props;
    return { beacon: { persistent, indexedDB }};
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}
