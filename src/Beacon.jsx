import React, { PropTypes } from 'react';
import sha1 from 'sha1';
import withClickOutside from 'react-onclickoutside';
import Config from './BeaconConfig';
import TetherComponent from 'react-tether';

import '../assets/style.styl';

const TOOLTIP_OVERLAY_CLASS = 'tour-overlay';
const TOOLTIP_FADED_CLASS = 'tour-faded';
const TARGET_CLONE_ID = 'tour-target-clone';
// How much difference we allow between tooltip target margins before we place
// the tooltip to one side or the other
const TOOLTIP_TOLERANCE = 50;

export class Beacon extends React.Component {

  static propTypes = {
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
    const appRoot = document.querySelector(`.${TOOLTIP_OVERLAY_CLASS}`);
    const appRootClassName = appRoot && appRoot.className;
    this.setState({ persistent, indexedDB, appRoot, appRootClassName });

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

  // Helper function to return the right attachment (before the target, after the target
  // or somewhere in-between) based on the margins around the target
  getAttachmentForMargins(start, end, before, after, between) {
    if (Math.abs(end - start) < TOOLTIP_TOLERANCE) {
      // Both margins are similar to place it in-between
      return between;
    } else if (start > end) {
      // More space on the first side
      return before;
    } else {
      // More space on the second side
      return after;
    }
  }

  getTooltipAttachment() {
    const rootElement = this.state.appRoot || document.body;
    const bounds = this.refs.tooltipTarget.getBoundingClientRect();
    const top = bounds.top;
    const bottom = rootElement.clientHeight - bounds.bottom;
    const left = bounds.left;
    const right = rootElement.clientWidth - bounds.right;
    const vertical = this.getAttachmentForMargins(top, bottom, 'bottom', 'top', 'middle');
    const horizontal = this.getAttachmentForMargins(left, right, 'right', 'left', 'center');
    return `${vertical} ${horizontal}`;
  }

  renderBeacon(persistent) {
    if (persistent && !this.state.hash) {
      // We need to wait until the hash is set before we render.
      // If it is never set, that means that the user has already
      // clicked on this beacon so we don't display it again.
      return false;
    }
    return (
      <TetherComponent attachment="middle center" constraints={[{ to: 'scrollParent' }]}>
        {React.cloneElement(this.props.children, { ref: 'tooltipTarget' })}
        <tour-beacon ref="beacon" onClick={::this.showTooltip}><span /></tour-beacon>
      </TetherComponent>
    );
  }

  renderTooltip(children) {
    const { appRoot, appRootClassName, tooltipActive } = this.state;

    if (appRoot) {
      const oldClone = document.getElementById(TARGET_CLONE_ID);
      if (!tooltipActive && oldClone) {
        oldClone.className = 'tour-clone';
        oldClone.addEventListener('transitionend', () => {
          oldClone.parentNode.removeChild(oldClone);
        }
        , false);
      }
      // If the user specified an app root using the `TOOLTIP_OVERLAY_CLASS`
      // then we fade out the background and highlight the target element of the tooltip.
      const beacons = Array.prototype.slice.call(document.getElementsByTagName('tour-beacon'));
      if (tooltipActive) {
        if (!oldClone) {
          appRoot.className = `${TOOLTIP_FADED_CLASS} ${appRootClassName}`;
          const targetClone = this.getTargetClone();
          document.body.appendChild(targetClone);
          // Hide beacons while tooltip is visible
          beacons.forEach(beacon => beacon.style.display = 'none');
        }
      } else {
        appRoot.className = appRootClassName;
        // Show beacons again
        beacons.forEach(beacon => beacon.style.display = 'block');
      }
    }

    return tooltipActive ?
      (<TetherComponent attachment={this.getTooltipAttachment()}>
          {this.props.children}
          <tour-tooltip className="tour-in" ref="tooltip">{this.props.tooltipText}</tour-tooltip>
        </TetherComponent>) :
      (<div>{children}</div>);
  }

  render() {
    const { persistent } = this.state;
    if (!this.state.tooltip) {
      return this.renderBeacon(persistent);
    } else {
      return this.renderTooltip(this.props.children);
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
