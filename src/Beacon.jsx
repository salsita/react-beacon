import React, { PropTypes } from 'react';
import Portal from 'react-portal';
import sha1 from 'sha1';
import withClickOutside from 'react-onclickoutside';
import Config from './BeaconConfig';

import '../assets/style.styl';

const BEACON_HEIGHT = 30;
const BEACON_WIDTH = 30;
const TOOLTIP_MARGIN = 10;
const TOOLTIP_OVERLAY_CLASS = 'tour-overlay';
const TOOLTIP_FADED_CLASS = 'tour-faded';
const TARGET_CLONE_ID = 'tour-target-clone';

export class Beacon extends React.Component {

  static propTypes = {
    position: PropTypes.string,
    persistent: PropTypes.bool,
    children: PropTypes.node
  }

  static contextTypes = {
    beacon: PropTypes.object
  }

  constructor(props) {
    super(props);

    this.state = {
      tooltip: false,
      tooltipActive: true,
      parentEl: null,
      tooltipHeight: 0,
      tooltipWidth: 0,
      appRoot: null,
      appRootClassName: ''
    };
  }

  componentWillMount() {
    const persistent = this.props.persistent || (this.context.beacon && this.context.beacon.persistent);
    const indexedDB = (this.context.beacon && this.context.beacon.indexedDB) || window.indexedDB;
    const position = this.props.position || (this.context.beacon && this.context.beacon.position) || 'left';
    this.setState({ position, persistent, indexedDB });

    if (persistent) {
      // Retrieve the state of the badge from the database
      // If `persistent` is `true` then we use the hash of the component's children
      // as a unique ID. `persistent` can be set to some other truthy value to override this default ID.
      const hash = persistent === true ? sha1(JSON.stringify(this.props.children)) : persistent;
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
    // We disable the linter here since we actually want to force a rerender in this case
    this.setState({ parentEl: this.refs.root.parentNode, appRoot, appRootClassName }); // eslint-disable-line react/no-did-mount-set-state
  }

  getParentBounds() {
    const bounds = this.state.parentEl.getBoundingClientRect();
    return {
      left: bounds.left + window.scrollX,
      right: bounds.right + window.scrollX,
      top: bounds.top + window.scrollY,
      bottom: bounds.bottom + window.scrollY
    };
  }

  getBeaconCoordinates(position) {
    const bounds = this.getParentBounds();
    switch (position) {
    case 'top':
      return {
        left: bounds.left + ((bounds.right - bounds.left - BEACON_WIDTH) / 2),
        top: bounds.top
      };
    case 'bottom':
      return {
        left: bounds.left + ((bounds.right - bounds.left - BEACON_WIDTH) / 2),
        top: bounds.bottom - BEACON_HEIGHT
      };
    case 'right':
      return {
        left: bounds.right - BEACON_WIDTH,
        top: bounds.top + ((bounds.bottom - bounds.top - BEACON_HEIGHT) / 2)
      };
    default:
    case 'left':
      return {
        left: bounds.left,
        top: bounds.top + ((bounds.bottom - bounds.top - BEACON_HEIGHT) / 2)
      };
    }
  }

  getTooltipCoordinates(position) {
    if (!this.state.tooltipHeight && !this.state.tooltipWidth) {
      // We need to draw the tooltip offscreen first to get the dimensions
      // return { left: -1000, top: -1000 };
      return { left: 0, top: 0 };
    }
    const bounds = this.getParentBounds();
    const screenSize = {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight
    };
    const tooltipSize = {
      width: this.state.tooltipWidth,
      height: this.state.tooltipHeight
    };
    const scrollOffset = {
      width: window.scrollX,
      height: window.scrollY
    };
    return this.calculateTooltipCoordinates(bounds, tooltipSize, screenSize, scrollOffset, position);
  }

  getTargetClone() {
    const tooltipTarget = this.state.parentEl;
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
    const { left, top } = this.getBeaconCoordinates(position);
    const style = {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`
    };
    return (
      <Portal isOpened>
        <tour-beacon style={style} onClick={::this.showTooltip}>
          <span />
        </tour-beacon>
      </Portal>
    );
  }

  renderTooltip(position, children) {
    const { left, top, className } = this.getTooltipCoordinates(position);
    if (className && this.state.appRoot) {
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
    const style = {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`
    };
    return (
      <div>
        <Portal isOpened onOpen={this.updateState.bind(this, this.props, this.state)}>
          <tour-tooltip ref="tooltip" class={className} style={style}>
            {children}
          </tour-tooltip>
        </Portal>
      </div>
    );
  }

  render() {
    if (!this.state.parentEl) {
      return (<noscript ref="root"></noscript>);
    }

    const { position, persistent } = this.state;
    if (!this.state.tooltip) {
      return this.renderBeacon(position, persistent);
    } else {
      return this.renderTooltip(position, this.props.children);
    }
  }

  // Adjust the secondary coordinate so it doesn't overflow the screen bounds
  // Also return the (potentially adjusted) class name
  calculateSecondaryCoordinateAndClassNames(name, start, size, boundStart, boundSize, className) {
    // Adjust start upwards if it is too low
    if (start < boundStart) {
      return {
        [name]: boundStart + TOOLTIP_MARGIN,
        className: `${className} tour-start`
      };
    // Or adjust it downwards if it is too high
    } else if ((start + size) > (boundStart + boundSize)) {
      return {
        [name]: (boundStart + boundSize) - size - TOOLTIP_MARGIN,
        className: `${className} tour-end`
      };
    } else {
      return {
        [name]: start,
        className: className
      };
    }
  }

  calculateTooltipCoordinates(bounds, tooltipSize, screenSize, scrollOffset, position) {
    const vertical = position === 'top' || position === 'bottom';
    const reverse = position === 'bottom' || position === 'right';
    const primaryCoordinate = vertical ? 'top' : 'left';
    const primaryComplement = vertical ? 'bottom' : 'right';
    const secondaryCoordinate = vertical ? 'left' : 'top';
    const secondaryComplement = vertical ? 'right' : 'bottom';
    const dimension = vertical ? 'height' : 'width';
    const secondaryDimension = vertical ? 'width' : 'height';
    const primaryCoordinateValue = reverse ?
      // For bottom or right we just take that bound and add the margin
      bounds[position] + TOOLTIP_MARGIN :
      // For top or left we shift over the extent of the tooltip in that dimension (plus margin)
      bounds[position] - tooltipSize[dimension] - TOOLTIP_MARGIN;
    const secondaryCoordinateValue =
      // Secondary coordinate is centered on the extent of the tooltip in that dimension
      bounds[secondaryCoordinate] +
      ((bounds[secondaryComplement] - bounds[secondaryCoordinate] - tooltipSize[secondaryDimension]) / 2);
    return {
      [primaryCoordinate]: primaryCoordinateValue,
      ...this.calculateSecondaryCoordinateAndClassNames(
        secondaryCoordinate,
        secondaryCoordinateValue,
        tooltipSize[secondaryDimension],
        scrollOffset[secondaryDimension],
        screenSize[secondaryDimension],
        `tour-${reverse ? primaryCoordinate : primaryComplement} tour-${this.state.tooltipActive ? 'in' : 'out'}`
      )
    };
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
