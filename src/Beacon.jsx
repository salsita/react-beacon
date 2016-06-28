import React, { PropTypes } from 'react';
import sha1 from 'sha1';
import withClickOutside from 'react-onclickoutside';
import Config from './BeaconConfig';
import TetherComponent from 'react-tether';

import '../assets/style.styl';

const TOOLTIP_OVERLAY_CLASS = 'tour-overlay';
const TOOLTIP_FADED_CLASS = 'tour-faded';
const TARGET_CLONE_ID = 'tour-target-clone';
const DEFAULT_POSITION = 'middle right';

export class Beacon extends React.Component {

  static propTypes = {
    position: PropTypes.string,
    persistent: PropTypes.bool,
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
      appRoot: null,
      appRootClassName: ''
    };
  }

  componentWillMount() {
    const persistent = this.props.persistent || (this.context.beacon && this.context.beacon.persistent);
    const indexedDB = (this.context.beacon && this.context.beacon.indexedDB) || window.indexedDB;
    const position = this.props.position || (this.context.beacon && this.context.beacon.position) || DEFAULT_POSITION;
    const appRoot = document.querySelector(`.${TOOLTIP_OVERLAY_CLASS}`);
    const appRootClassName = appRoot && appRoot.className;
    this.setState({ position, persistent, indexedDB, appRoot, appRootClassName });

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

  getTargetClone() {
    const tooltipTarget = this.refs.tooltipTarget;
    const clone = tooltipTarget.cloneNode(true);
    clone.removeAttribute('id');
    // Remove `-webkit-background-composite` style since browser complains about it being deprecated
    const computedStyle = getComputedStyle(tooltipTarget).cssText.replace(/-webkit-background-composite: [^;]+;/, '');
    clone.setAttribute('style', computedStyle);
    clone.style.position = 'absolute';
    clone.style.left = `${tooltipTarget.getBoundingClientRect().left + window.pageXOffset}px`;
    clone.style.top = `${tooltipTarget.getBoundingClientRect().top + window.pageYOffset}px`;
    clone.style.margin = '0px';
    clone.style.zIndex = tooltipTarget.zIndex + 1;
    clone.className = 'tour-clone';
    setTimeout(() => clone.className = 'tour-clone tour-highlighted', 0);
    clone.id = TARGET_CLONE_ID;
    return clone;
  }

  renderBeacon(position, persistent) {
    if (persistent && !this.state.hash) {
      // We need to wait until the hash is set before we render.
      // If it is never set, that means that the user has already
      // clicked on this beacon so we don't display it again.
      return false;
    }
    return (
      <TetherComponent attachment="middle center">
        {React.cloneElement(this.props.children, { ref: 'tooltipTarget' })}
        <tour-beacon onClick={::this.showTooltip}><span /></tour-beacon>
      </TetherComponent>
    );
  }

  renderTooltip(position, children) {
    if (this.state.appRoot) {
      const oldClone = document.getElementById(TARGET_CLONE_ID);
      if (!this.state.tooltipActive && oldClone) {
        oldClone.className = 'tour-clone';
        oldClone.addEventListener('transitionend', () => {
          oldClone.parentNode.removeChild(oldClone);
        }
        , false);
      }
      // If we have a `className` (i.e. we have the tooltip size and are rendering onscreen)
      // and the user specified an app root using the `TOOLTIP_OVERLAY_CLASS`
      // then we fade out the background and highlight the target element of the tooltip.
      const beacons = Array.prototype.slice.call(document.getElementsByTagName('tour-beacon'));
      if (this.state.tooltipActive) {
        if (!oldClone) {
          this.state.appRoot.className = `${TOOLTIP_FADED_CLASS} ${this.state.appRootClassName}`;
          const targetClone = this.getTargetClone();
          document.body.appendChild(targetClone);
          // Hide beacons while tooltip is visible
          beacons.forEach(beacon => beacon.style.display = 'none');
        }
      } else {
        this.state.appRoot.className = this.state.appRootClassName;
        // Show beacons again
        beacons.forEach(beacon => beacon.style.display = 'block');
      }
    }

    return this.state.tooltipActive ?
      (<TetherComponent attachment={position}>
          {this.props.children}
          <tour-tooltip ref="tooltip">{this.props.tooltipText}</tour-tooltip>
        </TetherComponent>) :
      (<div>{children}</div>);
  }

  render() {
    const { position, persistent } = this.state;
    if (!this.state.tooltip) {
      return this.renderBeacon(position, persistent);
    } else {
      return this.renderTooltip(position, this.props.children);
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

  updateState(prevProps, prevState) {
    if (this.refs.tooltip) {
      const bounds = this.refs.tooltip.getBoundingClientRect();
      const tooltipWidth = bounds.right - bounds.left;
      const tooltipHeight = bounds.bottom - bounds.top;
      if (tooltipWidth !== prevState.tooltipWidth || tooltipHeight !== prevState.tooltipHeight) {
        this.setState({ tooltipWidth, tooltipHeight });
      }
    }
  }
}

export default withClickOutside(Beacon);
export const BeaconConfig = Config;
