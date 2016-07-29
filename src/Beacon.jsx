import React, { Component } from 'react';
import reduxElm from 'redux-elm';
import { compose, createStore } from 'redux';
import { Provider, connect } from 'react-redux';

import BeaconView from './domain/beacon/view';
import beaconUpdater from './domain/beacon/updater';

const ConnectedView = connect(appState => appState)(BeaconView);

const storeFactory = compose(
  reduxElm,
  window.devToolsExtension ? window.devToolsExtension() : f => f
)(createStore);

export default class Beacon extends Component {

  constructor() {
    super();
    this.state = {
      store: storeFactory(beaconUpdater)
    };
  }

  render() {
    return (
      <Provider store={this.state.store}>
        <ConnectedView {...this.props} />
      </Provider>
    );
  }
}
