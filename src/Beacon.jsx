import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import sha1 from 'sha1';
import withClickOutside from 'react-onclickoutside';
import Config from './BeaconConfig';
import TetherComponent from 'react-tether';

import '../assets/style.styl';

const TOOLTIP_OVERLAY_CLASS = 'tour-overlay';
const TOOLTIP_FADED_CLASS = 'tour-faded';
const TARGET_CLONE_ID = 'tour-target-clone';
// If margins are within tolerance then we center tooltip
const TOOLTIP_TOLERANCE = 50;

export class Beacon extends Component {

  static propTypes = {
    persistent: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    tooltipText: PropTypes.string.isRequired,
    children: React.PropTypes.element.isRequired
  }

  static contextTypes = {
    beacon: PropTypes.object
  }

  constructor(props) {
    super(props);

    this.state = {
      tooltip: false,
      tooltipActive: true,
      tooltipHeight: 0,
      tooltipWidth: 0,
      tooltipHidden: false,
      centerTooltip: false,
      appRoot: null,
      appRootClassName: ''
    };
  }

  componentWillMount() {
    const persistent = this.props.persistent || (this.context.beacon && this.context.beacon.persistent);
    const indexedDB = (this.context.beacon && this.context.beacon.indexedDB) || window.indexedDB;
    this.setState({ persistent, indexedDB });

    if (persistent) {
      // Retrieve the state of the badge from the database
      // If `persistent` is `true` then we use the hash of the component's children
      // as a unique ID. `persistent` can be set to some other truthy value to override this default ID.
      const hash = persistent === true ? sha1(JSON.stringify(this.props.tooltipText)) : persistent;
      const request = indexedDB.open('react-beacon');
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore('beacons');
      };
      request.onsuccess = () => {
        this.setState({ database: request.result });
        const transaction = this.state.database.transaction(['beacons']);
        const objectStore = transaction.objectStore('beacons');
        objectStore.get(hash).onsuccess = (event) => {
          if (!event.target.result) {
            this.setState({ hash });
          }
        };
      };
    }
  }

  componentDidMount() {
    const appRoot = document.querySelector(`.${TOOLTIP_OVERLAY_CLASS}`);
    const appRootClassName = appRoot && appRoot.className;
    if (this.state.appRoot !== appRoot) {
      this.setState({ appRoot, appRootClassName }); // eslint-disable-line react/no-did-mount-set-state
    }
    const targetElement = this.getTargetElement();
    if (this.state.targetElement !== targetElement) {
      this.setState({ targetElement }); // eslint-disable-line react/no-did-mount-set-state
    }
  }

  componentWillUpdate() {
    // If margins are similar then center tooltip
    if (this.state.targetElement) {
      const bounds = this.state.targetElement.getBoundingClientRect();
      const centerTooltip = Math.abs(window.innerWidth - bounds.right - bounds.left) < TOOLTIP_TOLERANCE;
      if (this.state.centerTooltip !== centerTooltip) {
        this.setState({ centerTooltip });
      }
    }
  }

  componentDidUpdate() {
    const targetElement = this.getTargetElement();
    if (this.state.targetElement !== targetElement) {
      this.setState({ targetElement }); // eslint-disable-line react/no-did-update-set-state
    }
  }

  getTargetElement() {
    return ReactDOM.findDOMNode(this);
  }

  getTargetClone() {
    const targetElement = this.state.targetElement;
    if (!targetElement) {
      return null;
    }
    const clone = targetElement.cloneNode(true);
    clone.removeAttribute('id');
    clone.id = TARGET_CLONE_ID;
    // Remove `-webkit-background-composite` style since browser complains about it being deprecated
    const computedStyle = getComputedStyle(targetElement).cssText.replace(/-webkit-background-composite: [^;]+;/, '');
    clone.setAttribute('style', computedStyle);
    clone.style.position = 'absolute';
    clone.style.left = `${targetElement.getBoundingClientRect().left + window.pageXOffset}px`;
    clone.style.top = `${targetElement.getBoundingClientRect().top + window.pageYOffset}px`;
    clone.style.margin = '0px';
    clone.style.zIndex = targetElement.zIndex + 1;
    clone.className = 'tour-clone';
    setTimeout(() => clone.className = 'tour-clone tour-highlighted', 0);
    return clone;
  }

  renderBeacon(persistent) {
    if (persistent && !this.state.hash) {
      // We need to wait until the hash is set before we render.
      // If it is never set, that means that the user has already
      // clicked on this beacon so we don't display it again.
      return this.props.children;
    }
    return (
      <TetherComponent attachment="middle center" constraints={[{ to: 'window' }]}>
        {this.props.children}
        <tour-beacon ref="beacon" onClick={::this.showTooltip}><span /></tour-beacon>
      </TetherComponent>
    );
  }

  renderTooltip() {
    const { appRoot, appRootClassName, tooltipActive } = this.state;

    if (appRoot) {
      const oldClone = document.getElementById(TARGET_CLONE_ID);
      if (!tooltipActive && oldClone) {
        oldClone.className = 'tour-clone';
        oldClone.addEventListener('transitionend', () => {
          oldClone.parentNode.removeChild(oldClone);
          // Remember that we hid the tooltip so we don't use the `tour-out` class anymore
          this.setState({ tooltipHidden: true });
        }
        , false);
      }
      // If the user specified an app root using the `TOOLTIP_OVERLAY_CLASS`
      // then we fade out the background and highlight the target element of the tooltip.
      if (tooltipActive) {
        if (!oldClone) {
          appRoot.className = `${TOOLTIP_FADED_CLASS} ${appRootClassName}`;
          const targetClone = this.getTargetClone();
          document.body.appendChild(targetClone);
        }
      } else {
        appRoot.className = appRootClassName;
      }
    }

    const tooltipClass = tooltipActive ? 'tour-in' : !this.state.tooltipHidden && 'tour-out';
    return (
      <TetherComponent
        attachment={this.state.centerTooltip ? 'top center' : 'top left'}
        constraints={[
          {
            to: 'scrollParent',
            attachment: 'together'
          }
        ]}
      >
        {this.props.children}
        <tour-tooltip class={tooltipClass} ref="tooltip" dangerouslySetInnerHTML={{__html: this.props.tooltipText}} />
      </TetherComponent>
    );
  }

  render() {
    const { persistent } = this.state;
    if (!this.state.tooltip) {
      return this.renderBeacon(persistent);
    } else {
      return this.renderTooltip();
    }
  }

  handleClickOutside(event) {
    if (this.state.tooltip && this.state.tooltipActive) {
      event.preventDefault();
      this.setState({ tooltipActive: false });
    }
  }

  showTooltip(event) {
    event.preventDefault();
    this.setState({ tooltip: true });
    if (this.state.hash) {
      // Store the hash so we know this beacon has been clicked
      const transaction = this.state.database.transaction(['beacons'], 'readwrite');
      transaction.objectStore('beacons').add(true, this.state.hash);
    }
  }
}

export default withClickOutside(Beacon);
export const BeaconConfig = Config;
