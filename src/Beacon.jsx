import React, { PropTypes } from 'react';
import Portal from 'react-portal';
import Tooltip from 'react-portal-tooltip';
const withClickOutside = require('react-onclickoutside');

import '../assets/style.less';

const BEACON_HEIGHT = 30;
const BEACON_WIDTH = 30;

export default withClickOutside(class Beacon extends React.Component {

  static propTypes = {
    parent: PropTypes.string,
    position: PropTypes.string,
    children: PropTypes.node
  }

  constructor(props) {
    super(props);

    this.state = { tooltip: false, tooltipActive: true, parentEl: null };
  }

  componentDidMount() {
    const { parent } = this.props;
    this.setState({ parentEl: document.querySelector(parent) });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.parent !== this.props.parent) {
      const { parent } = this.props;
      this.setState({ parentEl: document.querySelector(parent) });
    }
  }

  getCoordinates(position, bounds) {
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

  render() {
    const { parent, position, children } = this.props;
    if (!this.state.tooltip) {
      if (!this.state.parentEl) {
        return false;
      }
      const bounds = this.state.parentEl.getBoundingClientRect();
      const { left, top } = this.getCoordinates(position, bounds);
      const style = {
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`
      };
      return (
        <Portal isOpened>
          <tour-beacon class="ignore-react-onclickoutside" style={style} onClick={::this.showTooltip} />
        </Portal>
      );
    } else {
      const style = {
        style: { boxShadow: 'none' },
        arrowStyle: {}
      };
      return (
        <Portal isOpened>
          <Tooltip
            parent={parent}
            tooltipTimeout={200}
            style={style}
            active={this.state.tooltipActive}
            position={position}
          >
            {children}
          </Tooltip>
        </Portal>
      );
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
});
