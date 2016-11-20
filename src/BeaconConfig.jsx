import React, { Component, PropTypes } from 'react';

const INACTIVE_PROP = 'inactive';

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

  constructor(props) {
    super(props);

    this.state = {
      dbCache: {},
      requestQueue: [],
      active: false
    };

    this.beacons = [];
  }

  componentWillMount() {
    const request = this.props.indexedDB.open('react-beacon');
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('beacons');
    };
    request.onsuccess = () => {
      const database = request.result;
      this.setState({ database });

      // Load active state from database
      const transaction = database.transaction(['beacons']);
      const objectStore = transaction.objectStore('beacons');
      objectStore.get(INACTIVE_PROP).onsuccess = (event) => {
        this.setActiveState(!event.target.result);
      };

      // Flush pending requests from queue
      this.state.requestQueue.forEach(req => this.loadHash(req.hash, req.callback));
    };
  }

  getChildContext() {
    const { persistent } = this.props;
    return {
      beacon: {
        persistent,
        getActive: () => this.state.active,
        registerBeacon: beacon => this.registerBeacon(beacon),
        unregisterBeacon: beacon => this.unregisterBeacon(beacon),
        storeHash: hash => this.storeHash(hash),
        loadHash: (hash, callback) => this.loadHash(hash, callback),
        checkHash: hash => this.checkHash(hash),
        handleDontShow: () => this.handleDontShow()
      }
    };
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }

  setActiveState(active) {
    this.setState({ active });

    // Need to update all beacons manually since context changes don't trigger re-render
    this.beacons.forEach(beacon => beacon.forceUpdate());
  }

  registerBeacon(beacon) {
    if (this.beacons.indexOf(beacon) === -1) {
      this.beacons.push(beacon);
    }
  }

  unregisterBeacon(beacon) {
    this.beacons = this.beacons.filter(item => item !== beacon);
  }

  storeHash(hash) {
    const transaction = this.state.database.transaction(['beacons'], 'readwrite');
    transaction.objectStore('beacons').add(true, hash);

    this.setState({ dbCache: { ...this.state.dbCache, [hash]: hash }});
  }

  loadHash(hash, callback) {
    if (hash in this.state.dbCache && callback) {
      callback(this.state.dbCache[hash] !== null);
    } else if (!this.state.database) {
      // Database is not open yet so queue request
      this.state.requestQueue.push({ hash: hash, callback: callback });
    } else {
      const transaction = this.state.database.transaction(['beacons']);
      const objectStore = transaction.objectStore('beacons');
      objectStore.get(hash).onsuccess = (event) => {
        this.state.dbCache[hash] = event.target.result ? hash : null;
        if (callback) {
          callback(event.target.result);
        }
      };
    }
  }

  checkHash(hash) {
    return (hash in this.state.dbCache) && this.state.dbCache[hash];
  }

  handleDontShow() {
    const transaction = this.state.database.transaction(['beacons'], 'readwrite');
    transaction.objectStore('beacons').add(true, INACTIVE_PROP);
    this.setActiveState(false);
  }
}
