'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactPortal = require('react-portal');

var _reactPortal2 = _interopRequireDefault(_reactPortal);

var _reactPortalTooltip = require('react-portal-tooltip');

var _reactPortalTooltip2 = _interopRequireDefault(_reactPortalTooltip);

require('../assets/style.less');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var withClickOutside = require('react-onclickoutside');

var BEACON_HEIGHT = 30;
var BEACON_WIDTH = 30;

exports["default"] = withClickOutside((_temp = _class = function (_React$Component) {
  _inherits(Beacon, _React$Component);

  function Beacon(props) {
    _classCallCheck(this, Beacon);

    var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

    _this.state = { tooltip: false, tooltipActive: true, parentEl: null };
    return _this;
  }

  Beacon.prototype.componentDidMount = function componentDidMount() {
    var parent = this.props.parent;

    this.setState({ parentEl: document.querySelector(parent) });
  };

  Beacon.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
    if (prevProps.parent !== this.props.parent) {
      var parent = this.props.parent;

      this.setState({ parentEl: document.querySelector(parent) });
    }
  };

  Beacon.prototype.getCoordinates = function getCoordinates(position, bounds) {
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

  Beacon.prototype.render = function render() {
    var _props = this.props;
    var parent = _props.parent;
    var position = _props.position;
    var children = _props.children;

    if (!this.state.tooltip) {
      if (!this.state.parentEl) {
        return false;
      }
      var bounds = this.state.parentEl.getBoundingClientRect();

      var _getCoordinates = this.getCoordinates(position, bounds);

      var left = _getCoordinates.left;
      var top = _getCoordinates.top;

      var style = {
        position: 'absolute',
        left: left + 'px',
        top: top + 'px'
      };
      return _react2["default"].createElement(
        _reactPortal2["default"],
        { isOpened: true },
        _react2["default"].createElement('tour-beacon', { 'class': 'ignore-react-onclickoutside', style: style, onClick: this.showTooltip.bind(this) })
      );
    } else {
      var _style = {
        style: { boxShadow: 'none' },
        arrowStyle: {}
      };
      var oppositePositions = { left: 'right', right: 'left', top: 'bottom', bottom: 'top' };
      var tooltipClass = oppositePositions[position];
      return _react2["default"].createElement(
        _reactPortal2["default"],
        { isOpened: true },
        _react2["default"].createElement(
          _reactPortalTooltip2["default"],
          {
            parent: parent,
            tooltipTimeout: 200,
            style: _style,
            active: this.state.tooltipActive,
            position: position
          },
          _react2["default"].createElement(
            'tour-tooltip',
            { 'class': tooltipClass },
            children
          )
        )
      );
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

  return Beacon;
}(_react2["default"].Component), _class.propTypes = {
  parent: _react.PropTypes.string,
  position: _react.PropTypes.string,
  children: _react.PropTypes.node
}, _temp));
module.exports = exports['default'];