webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactDom = __webpack_require__(159);
	
	var _reactDom2 = _interopRequireDefault(_reactDom);
	
	var _reactBeacon = __webpack_require__(160);
	
	var _reactBeacon2 = _interopRequireDefault(_reactBeacon);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }
	
	var Test = function (_React$Component) {
	  _inherits(Test, _React$Component);
	
	  function Test() {
	    _classCallCheck(this, Test);
	
	    return _possibleConstructorReturn(this, _React$Component.apply(this, arguments));
	  }
	
	  Test.prototype.renderBlock = function renderBlock(id, left, child) {
	    var style = {
	      height: '60px',
	      width: '30px',
	      position: 'relative',
	      padding: 'none',
	      margin: 'none',
	      border: 'none',
	      left: left + 'px',
	      backgroundColor: 'red'
	    };
	    return _react2["default"].createElement(
	      'div',
	      { style: style },
	      id,
	      child
	    );
	  };
	
	  Test.prototype.render = function render() {
	    return _react2["default"].createElement(
	      'div',
	      null,
	      _react2["default"].createElement(
	        'h1',
	        null,
	        'Beacon Example'
	      ),
	      this.renderBlock('left', 0, _react2["default"].createElement(
	        _reactBeacon2["default"],
	        { position: 'top' },
	        'This is a tooltip'
	      )),
	      this.renderBlock('left', 0, _react2["default"].createElement(
	        _reactBeacon2["default"],
	        { position: 'bottom' },
	        'This is a tooltip'
	      )),
	      this.renderBlock('right', 470, _react2["default"].createElement(
	        _reactBeacon2["default"],
	        { position: 'top' },
	        'This is a tooltip'
	      )),
	      this.renderBlock('right', 470, _react2["default"].createElement(
	        _reactBeacon2["default"],
	        { position: 'bottom' },
	        'This is a tooltip'
	      ))
	    );
	  };
	
	  return Test;
	}(_react2["default"].Component);
	
	document.body.style = 'margin: 0px';
	var contentDoc = document.getElementById('main_frame').contentDocument;
	contentDoc.body.style = 'margin: 0px';
	var root = contentDoc.body;
	var container = contentDoc.createElement('div');
	root.appendChild(container);
	_reactDom2["default"].render(_react2["default"].createElement(Test, null), container);

/***/ }
]);
//# sourceMappingURL=edges.js.map