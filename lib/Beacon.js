'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactPortal = require('react-portal');

var _reactPortal2 = _interopRequireDefault(_reactPortal);

require('../assets/style.less');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var withClickOutside = require('react-onclickoutside');

var BEACON_HEIGHT = 30;
var BEACON_WIDTH = 30;
var TOOLTIP_MARGIN = 10;
var TOOLTIP_OVERLAY_CLASS = 'tour-tooltip-overlay';
var TARGET_CLONE_ID = 'tour-target-clone';

exports["default"] = withClickOutside((_temp = _class = function (_React$Component) {
  _inherits(Beacon, _React$Component);

  function Beacon(props) {
    _classCallCheck(this, Beacon);

    var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

    _this.state = {
      tooltip: false,
      tooltipActive: true,
      parentEl: null,
      tooltipHeight: 0,
      tooltipWidth: 0,
      appRootClassName: ''
    };
    return _this;
  }

  Beacon.prototype.componentDidMount = function componentDidMount() {
    var appRoot = document.getElementById(this.props.appRoot);
    var appRootClasses = appRoot.className.split(' ').filter(function (className) {
      return className && className !== TOOLTIP_OVERLAY_CLASS;
    });
    this.setState({ parentEl: this.refs.root.parentNode, appRootClasses: appRootClasses });
  };

  Beacon.prototype.componentDidUpdate = function componentDidUpdate(prevProps, prevState) {
    this.updateState(prevProps, prevState);
  };

  Beacon.prototype.componentWillUnmount = function componentWillUnmount() {
    if (!document.getElementsByTagName('tour-tooltip').length) {
      var appRootElement = document.getElementById(this.props.appRoot);
      appRootElement.className = this.state.appRootClasses.join(' ');
    }
  };

  Beacon.prototype.getParentBounds = function getParentBounds() {
    var bounds = this.state.parentEl.getBoundingClientRect();
    return {
      left: bounds.left + window.scrollX,
      right: bounds.right + window.scrollX,
      top: bounds.top + window.scrollY,
      bottom: bounds.bottom + window.scrollY
    };
  };

  Beacon.prototype.getBeaconCoordinates = function getBeaconCoordinates(position) {
    var bounds = this.getParentBounds();
    switch (position) {
      case 'top':
        return {
          left: bounds.left + (bounds.right - bounds.left - BEACON_WIDTH) / 2,
          top: bounds.top
        };
      case 'bottom':
        return {
          left: bounds.left + (bounds.right - bounds.left - BEACON_WIDTH) / 2,
          top: bounds.bottom - BEACON_HEIGHT
        };
      case 'right':
        return {
          left: bounds.right - BEACON_WIDTH,
          top: bounds.top + (bounds.bottom - bounds.top - BEACON_HEIGHT) / 2
        };
      default:
      case 'left':
        return {
          left: bounds.left,
          top: bounds.top + (bounds.bottom - bounds.top - BEACON_HEIGHT) / 2
        };
    }
  };

  // Adjust the secondary coordinate so it doesn't overflow the screen bounds
  // Also return the (potentially adjusted) class name


  Beacon.prototype.calculateSecondaryCoordinateAndClassNames = function calculateSecondaryCoordinateAndClassNames(name, start, size, boundStart, boundSize, className) {
    // Adjust start upwards if it is too low
    if (start < boundStart) {
      var _ref;

      return _ref = {}, _defineProperty(_ref, name, boundStart), _defineProperty(_ref, 'className', className + ' start'), _ref;
      // Or adjust it downwards if it is too high
    } else if (start + size > boundStart + boundSize) {
        var _ref2;

        return _ref2 = {}, _defineProperty(_ref2, name, boundStart + boundSize - size), _defineProperty(_ref2, 'className', className + ' end'), _ref2;
      } else {
        var _ref3;

        return _ref3 = {}, _defineProperty(_ref3, name, start), _defineProperty(_ref3, 'className', className), _ref3;
      }
  };

  Beacon.prototype.calculateTooltipCoordinates = function calculateTooltipCoordinates(bounds, tooltipSize, screenSize, scrollOffset, position) {
    var vertical = position === 'top' || position === 'bottom';
    var reverse = position === 'bottom' || position === 'right';
    var primaryCoordinate = vertical ? 'top' : 'left';
    var primaryComplement = vertical ? 'bottom' : 'right';
    var secondaryCoordinate = vertical ? 'left' : 'top';
    var secondaryComplement = vertical ? 'right' : 'bottom';
    var dimension = vertical ? 'height' : 'width';
    var secondaryDimension = vertical ? 'width' : 'height';
    var primaryCoordinateValue = reverse ?
    // For bottom or right we just take that bound and add the margin
    bounds[position] + TOOLTIP_MARGIN :
    // For top or left we shift over the extent of the tooltip in that dimension (plus margin)
    bounds[position] - tooltipSize[dimension] - TOOLTIP_MARGIN;
    var secondaryCoordinateValue =
    // Secondary coordinate is centered on the extent of the tooltip in that dimension
    bounds[secondaryCoordinate] + (bounds[secondaryComplement] - bounds[secondaryCoordinate] - tooltipSize[secondaryDimension]) / 2;
    return _extends(_defineProperty({}, primaryCoordinate, primaryCoordinateValue), this.calculateSecondaryCoordinateAndClassNames(secondaryCoordinate, secondaryCoordinateValue, tooltipSize[secondaryDimension], scrollOffset[secondaryDimension], screenSize[secondaryDimension], reverse ? primaryCoordinate : primaryComplement));
  };

  Beacon.prototype.getTooltipCoordinates = function getTooltipCoordinates(position) {
    if (!this.state.tooltipHeight && !this.state.tooltipWidth) {
      // We need to draw the tooltip offscreen first to get the dimensions
      return { left: -1000, top: -1000 };
    }
    var bounds = this.getParentBounds();
    var screenSize = {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight
    };
    var tooltipSize = {
      width: this.state.tooltipWidth,
      height: this.state.tooltipHeight
    };
    var scrollOffset = {
      width: window.scrollX,
      height: window.scrollY
    };
    return this.calculateTooltipCoordinates(bounds, tooltipSize, screenSize, scrollOffset, position);
  };

  Beacon.prototype.getTargetClone = function getTargetClone() {
    var tooltipTarget = this.state.parentEl;
    var clone = tooltipTarget.cloneNode(true);
    clone.removeAttribute('id');
    clone.setAttribute('style', getComputedStyle(tooltipTarget).cssText);
    clone.style.position = 'fixed';
    clone.style.left = tooltipTarget.getBoundingClientRect().left + 'px';
    clone.style.top = tooltipTarget.getBoundingClientRect().top + 'px';
    clone.style.margin = '0px';
    clone.style.zIndex = tooltipTarget.zIndex + 1;
    clone.className = 'highlighted';
    clone.id = TARGET_CLONE_ID;
    return clone;
  };

  Beacon.prototype.renderBeacon = function renderBeacon(position) {
    var _getBeaconCoordinates = this.getBeaconCoordinates(position);

    var left = _getBeaconCoordinates.left;
    var top = _getBeaconCoordinates.top;

    var style = {
      position: 'absolute',
      left: left + 'px',
      top: top + 'px'
    };
    return _react2["default"].createElement(
      _reactPortal2["default"],
      { isOpened: true },
      _react2["default"].createElement('tour-beacon', { style: style, onClick: this.showTooltip.bind(this) })
    );
  };

  Beacon.prototype.renderTooltip = function renderTooltip(appRoot, position, children) {
    var oldClone = document.getElementById('tour-target-clone');
    if (oldClone) {
      oldClone.parentNode.removeChild(oldClone);
    }
    var appRootElement = document.getElementById(appRoot);
    var beacons = Array.prototype.slice.call(document.getElementsByTagName('tour-beacon'));
    if (this.state.tooltipActive) {
      appRootElement.className = [TOOLTIP_OVERLAY_CLASS, 'faded'].concat(this.state.appRootClasses).join(' ');
      var targetClone = this.getTargetClone();
      document.body.appendChild(targetClone);
      // Hide beacons while tooltip is visible
      beacons.forEach(function (beacon) {
        return beacon.style.display = 'none';
      });
    } else {
      appRootElement.className = [TOOLTIP_OVERLAY_CLASS].concat(this.state.appRootClasses).join(' ');
      // Show beacons again
      beacons.forEach(function (beacon) {
        return beacon.style.display = 'block';
      });
    }

    var _getTooltipCoordinate = this.getTooltipCoordinates(position);

    var left = _getTooltipCoordinate.left;
    var top = _getTooltipCoordinate.top;
    var className = _getTooltipCoordinate.className;

    var style = {
      position: 'absolute',
      left: left + 'px',
      top: top + 'px',
      visibility: this.state.tooltipActive ? 'visible' : 'hidden'
    };
    return _react2["default"].createElement(
      'div',
      null,
      _react2["default"].createElement(
        _reactPortal2["default"],
        { isOpened: true, onOpen: this.updateState.call(this, this.props, this.state) },
        _react2["default"].createElement(
          'tour-tooltip',
          { ref: 'tooltip', 'class': className, style: style },
          children
        )
      )
    );
  };

  Beacon.prototype.render = function render() {
    if (!this.state.parentEl) {
      return _react2["default"].createElement('noscript', { ref: 'root' });
    }

    var _props = this.props;
    var appRoot = _props.appRoot;
    var position = _props.position;
    var children = _props.children;

    if (!this.state.tooltip) {
      return this.renderBeacon(position);
    } else {
      return this.renderTooltip(appRoot, position, children);
    }
  };

  Beacon.prototype.handleClickOutside = function handleClickOutside() {
    if (this.state.tooltip) {
      this.setState({ tooltipActive: false });
    }
  };

  Beacon.prototype.showTooltip = function showTooltip() {
    this.setState({ tooltip: true });
  };

  Beacon.prototype.updateState = function updateState(prevProps, prevState) {
    if (this.refs.tooltip) {
      var bounds = this.refs.tooltip.getBoundingClientRect();
      var tooltipWidth = bounds.right - bounds.left;
      var tooltipHeight = bounds.bottom - bounds.top;
      if (tooltipWidth !== prevState.tooltipWidth || tooltipHeight !== prevState.tooltipHeight) {
        this.setState({ tooltipWidth: tooltipWidth, tooltipHeight: tooltipHeight });
      }
    }
  };

  return Beacon;
}(_react2["default"].Component), _class.propTypes = {
  appRoot: _react.PropTypes.string,
  position: _react.PropTypes.string,
  children: _react.PropTypes.node
}, _temp));
module.exports = exports['default'];