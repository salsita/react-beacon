import React, { PropTypes } from 'react';
import Portal from 'react-portal';
const withClickOutside = require('react-onclickoutside');

import '../assets/style.less';

const BEACON_HEIGHT = 30;
const BEACON_WIDTH = 30;
const TOOLTIP_MARGIN = 10;
const TOOLTIP_OVERLAY_CLASS = 'tour-tooltip-overlay';
const TARGET_CLONE_ID = 'tour-target-clone';

export default withClickOutside(class Beacon extends React.Component {

  static propTypes = {
    appRoot: PropTypes.string,
    position: PropTypes.string,
    children: PropTypes.node
  }

  constructor(props) {
    super(props);

    this.state = {
      tooltip: false,
      tooltipActive: true,
      parentEl: null,
      tooltipHeight: 0,
      tooltipWidth: 0,
      appRootClassName: ''
    };
  }

  componentDidMount() {
    const appRoot = document.getElementById(this.props.appRoot);
    const appRootClasses = appRoot.className.split(' ').filter(
      className => className && className !== TOOLTIP_OVERLAY_CLASS
    );
    this.setState({ parentEl: this.refs.root.parentNode, appRootClasses });
  }

  componentDidUpdate(prevProps, prevState) {
    this.updateState(prevProps, prevState);
  }

  componentWillUnmount() {
    if (!document.getElementsByTagName('tour-tooltip').length) {
      const appRootElement = document.getElementById(this.props.appRoot);
      appRootElement.className = this.state.appRootClasses.join(' ');
    }
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

  // Adjust the secondary coordinate so it doesn't overflow the screen bounds
  // Also return the (potentially adjusted) class name
  calculateSecondaryCoordinateAndClassNames(name, start, size, boundStart, boundSize, className) {
    // Adjust start upwards if it is too low
    if (start < boundStart) {
      return {
        [name]: boundStart,
        className: `${className} start`
      };
    // Or adjust it downwards if it is too high
    } else if ((start + size) > (boundStart + boundSize)) {
      return {
        [name]: (boundStart + boundSize) - size,
        className: `${className} end`
      };
    } else {
      return {
        [name]: start,
        className: className
      };
    }
  }

  calculateTooltipCoordinates(bounds, tooltipSize, screenSize, scrollOffset, position, ) {
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
        reverse ? primaryCoordinate : primaryComplement
      )
    };
  }

  getTooltipCoordinates(position) {
    if (!this.state.tooltipHeight && !this.state.tooltipWidth) {
      // We need to draw the tooltip offscreen first to get the dimensions
      return { left: -1000, top: -1000 };
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
    clone.setAttribute('style', getComputedStyle(tooltipTarget).cssText);
    clone.style.position = 'fixed';
    clone.style.left = `${tooltipTarget.getBoundingClientRect().left}px`;
    clone.style.top = `${tooltipTarget.getBoundingClientRect().top}px`;
    clone.style.margin = '0px';
    clone.style.zIndex = tooltipTarget.zIndex + 1;
    clone.className = 'highlighted';
    clone.id = TARGET_CLONE_ID;
    return clone;
  }

  renderBeacon(position) {
    const { left, top } = this.getBeaconCoordinates(position);
    const style = {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`
    };
    return (
      <Portal isOpened>
        <tour-beacon style={style} onClick={::this.showTooltip} />
      </Portal>
    );
  }

  renderTooltip(appRoot, position, children) {
    const oldClone = document.getElementById('tour-target-clone');
    if (oldClone) {
      oldClone.parentNode.removeChild(oldClone);
    }
    const appRootElement = document.getElementById(appRoot);
    const beacons = Array.prototype.slice.call(document.getElementsByTagName('tour-beacon'));
    if (this.state.tooltipActive) {
      appRootElement.className = [TOOLTIP_OVERLAY_CLASS, 'faded'].concat(this.state.appRootClasses).join(' ');
      const targetClone = this.getTargetClone();
      document.body.appendChild(targetClone);
      // Hide beacons while tooltip is visible
      beacons.forEach(beacon => beacon.style.display = 'none');
    } else {
      appRootElement.className = [TOOLTIP_OVERLAY_CLASS].concat(this.state.appRootClasses).join(' ');
      // Show beacons again
      beacons.forEach(beacon => beacon.style.display = 'block');
    }
    const { left, top, className } = this.getTooltipCoordinates(position);
    const style = {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      visibility: this.state.tooltipActive ? 'visible' : 'hidden'
    };
    return (
      <div>
        <Portal isOpened onOpen={::this.updateState(this.props, this.state)}>
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

    const { appRoot, position, children } = this.props;
    if (!this.state.tooltip) {
      return this.renderBeacon(position);
    } else {
      return this.renderTooltip(appRoot, position, children);
    }
  }

  handleClickOutside() {
    if (this.state.tooltip) {
      this.setState({ tooltipActive: false });
    }
  }

  showTooltip() {
    this.setState({ tooltip: true });
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
});
