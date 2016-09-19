import React, { Component, Children, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import sha1 from 'sha1';
import withClickOutside from 'react-onclickoutside';
import Config from './BeaconConfig';
import TetherComponent from 'react-tether';
import '../assets/style.styl';

const TOOLTIP_OVERLAY_CLASS = 'tour-overlay';
const TOOLTIP_FADED_CLASS = 'tour-faded';
const TARGET_CLONE_ID = 'tour-target-clone';
// If margins are within tolerance then we center tooltip
// Tolerance is ratio of margins to total dimension (height or width)
// So if the difference between the tooltip margins is less than
// `dimension/4` then we center it.
const TOOLTIP_TOLERANCE_RATIO = 4;

const TOOLTIP_STATE_VARIABLES = [
  'tooltipActive',
  'tooltipHeight',
  'tooltipWidth',
  'tooltipHidden',
  'tooltipAttachmentVertical',
  'tooltipAttachmentHorizontal',
  'arrowPosition',
  'appRoot',
  'appRootClassName'
];

// Arrow min/max offset from tooltip edge
const ARROW_POSITION_FROM_EDGE = 10;

const HASH_CHECK_PENDING = 'PENDING';
const HASH_CHECK_NOT_PERSISTENT = 'NOT_PERSISTENT';
const HASH_CHECK_FOUND = 'FOUND';
const HASH_CHECK_NOT_FOUND = 'NOT_FOUND';

function deepCloneNode(node, parent, fn) {
  const clone = fn(node, parent);
  const childNodes = Array.prototype.slice.call(node.childNodes);
  childNodes.forEach(childNode => deepCloneNode(childNode, clone, fn));
  return clone;
}

export class Beacon extends Component {

  static propTypes = {
    id: PropTypes.string,
    active: PropTypes.bool,
    tooltipText: PropTypes.node.isRequired,
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
      tooltipAttachmentVertical: null,
      tooltipAttachmentHorizontal: null,
      arrowPosition: null,
      inactive: false,
      appRoot: null,
      appRootClassName: '',
      hashCheck: HASH_CHECK_PENDING
    };
  }

  componentWillMount() {
    const inactive = (this.props.active === false) || (this.context.beacon && (this.context.beacon.active === false));
    const persistent = this.context.beacon && this.context.beacon.persistent;
    this.setState({ inactive, persistent });

    this.loadHash(persistent);
  }

  componentDidMount() {
    const appRoot = document.querySelector(`.${TOOLTIP_OVERLAY_CLASS}`);
    const appRootClassName = appRoot && appRoot.className;
    if (this.state.appRoot !== appRoot) {
      this.setState({ appRoot, appRootClassName }); // eslint-disable-line react/no-did-mount-set-state
    }
    const targetElement = this.getTargetElement();
    const targetBounds = targetElement.getBoundingClientRect();
    if (this.state.targetElement !== targetElement) {
      this.setState({ targetElement, targetBounds }); // eslint-disable-line react/no-did-mount-set-state
    }
  }

  componentWillReceiveProps(nextProps) {
    const inactive = (nextProps.active === false) || (this.context.beacon && (this.context.beacon.active === false));
    if (inactive !== this.state.inactive) {
      this.setState({ inactive });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (Object.keys(this.props).some(key => this.props[key] !== nextProps[key])) {
      // Always update if any prop has changed
      return true;
    } else if (this.state.tooltip !== nextState.tooltip) {
      return true;
    } else if (
      nextState.tooltip &&
      TOOLTIP_STATE_VARIABLES.some(key => this.state[key] !== nextState[key])
    ) {
      // Update if we are showing the tooltip and one of the relevant state variables has changed
      return true;
    } else if (
      !nextState.tooltip &&
      (this.state.inactive !== nextState.inactive || this.state.hashCheck !== this.checkHashStatus())
    ) {
      // Update if inactive state or hash status have changed. Other state changes do not affect
      // the beacon view.
      return true;
    } else {
      // In all other cases we can optimize by skipping the update
      return false;
    }
  }

  componentWillUpdate() {
    const hashCheck = this.checkHashStatus();
    if (this.state.hashCheck !== hashCheck) {
      this.setState({ hashCheck });
    }

    // If margins are similar then center tooltip
    if (this.state.targetBounds) {
      const tooltipAttachmentHorizontal = this.getHorizontalAttachment(this.state.targetBounds);
      const tooltipAttachmentVertical = this.getVerticalAttachment(this.state.targetBounds, tooltipAttachmentHorizontal);
      if ((this.state.tooltipAttachmentVertical !== tooltipAttachmentVertical) ||
         (this.state.tooltipAttachmentHorizontal !== tooltipAttachmentHorizontal)) {
        this.setState({ tooltipAttachmentVertical, tooltipAttachmentHorizontal });
      }
    }
  }

  componentDidUpdate() {
    if (!this.state.tooltip) {
      const targetElement = this.getTargetElement();
      if (this.state.targetElement !== targetElement) {
        this.setState({ targetElement }); // eslint-disable-line react/no-did-update-set-state
      }
    }
    const targetElement = this.getTargetElement();
    if (targetElement) {
      const targetBounds = targetElement.getBoundingClientRect();
      const boundsChanged =
        this.state.targetBounds.top !== targetBounds.top ||
        this.state.targetBounds.bottom !== targetBounds.bottom ||
        this.state.targetBounds.left !== targetBounds.left ||
        this.state.targetBounds.right !== targetBounds.right;
      if (boundsChanged || (this.state.targetElement !== targetElement)) {
        this.setState({ targetElement, targetBounds }); // eslint-disable-line react/no-did-update-set-state
      }
    }

    if (this.state.tooltip && !this.state.arrowPosition) {
      // Calculate relative arrow position when ref is available
      setTimeout(() => {
        const arrowStyleLeft = this.getArrowHorizontalPosition(
          targetElement.getBoundingClientRect(),
          this.refs['tooltip'].getBoundingClientRect(),
          this.refs['tooltipArrow'].getBoundingClientRect()
        );
        this.setState({
          arrowPosition: (this.state.tooltipAttachmentVertical === 'top' ||
            this.state.tooltipAttachmentVertical === 'bottom') ?
            { left: arrowStyleLeft, right: 'auto' } :
            { top: '50%', bottom: 'auto' }
        });
      }, 0);
    }
  }

  getVerticalAttachment(bounds, horizontalAttachment) {
    const marginBottom = window.innerHeight - bounds.bottom;
    const marginTop = bounds.top;
    const tolerance = window.innerHeight / TOOLTIP_TOLERANCE_RATIO;
    if (Math.abs(marginBottom - marginTop) < tolerance && horizontalAttachment !== 'center') {
      return 'middle';
    } else if (marginBottom < marginTop) {
      return 'bottom';
    } else {
      return 'top';
    }
  }

  getHorizontalAttachment(bounds) {
    const marginRight = window.innerWidth - bounds.right;
    const marginLeft = bounds.left;
    const tolerance = window.innerWidth / TOOLTIP_TOLERANCE_RATIO;
    if (Math.abs(marginRight - marginLeft) < tolerance) {
      return 'center';
    } else if (marginRight < marginLeft) {
      return 'right';
    } else {
      return 'left';
    }
  }

  clampValueToRange(val, min, max) {
    return Math.min(Math.max(min, val), max);
  }

  getArrowHorizontalPosition(targetBounds, tooltipBounds, arrowBounds) {
    // Calculate real distance from target center and adjust to position in tooltip
    const targetCenter = targetBounds.left + (targetBounds.width / 2);
    const edgeDistance = targetCenter - tooltipBounds.left;
    const arrowMaxLeft = tooltipBounds.width - ARROW_POSITION_FROM_EDGE - arrowBounds.width;
    return this.clampValueToRange(edgeDistance, ARROW_POSITION_FROM_EDGE, arrowMaxLeft);
  }

  getTooltipOffset() {
    switch (this.state.tooltipAttachmentHorizontal) {
    case 'left': return '0 28px';
    case 'right': return '0 -28px';
    default: return '0 0';
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

    const targetClone = deepCloneNode(targetElement, null, (node, cloneParent) => {
      const clone = node.cloneNode(false);
      if (clone.nodeType === Node.ELEMENT_NODE) {
        clone.removeAttribute('id');
        // Remove `-webkit-background-composite` style since browser complains about it being deprecated
        const computedStyle = getComputedStyle(node).cssText.replace(/-webkit-background-composite: [^;]+;/, '');
        clone.setAttribute('style', computedStyle);
      }
      if (cloneParent) {
        cloneParent.appendChild(clone);
      }
      return clone;
    });

    targetClone.id = TARGET_CLONE_ID;
    targetClone.style.position = 'absolute';
    targetClone.style.left = `${targetElement.getBoundingClientRect().left + window.pageXOffset}px`;
    targetClone.style.top = `${targetElement.getBoundingClientRect().top + window.pageYOffset}px`;
    targetClone.style.margin = '0px';
    targetClone.style.zIndex = targetElement.zIndex + 1;
    targetClone.className = 'tour-clone';
    setTimeout(() => targetClone.className = 'tour-clone tour-highlighted', 0);
    return targetClone;
  }

  getHash() {
    const { tooltipText, id } = this.props;
    const text = typeof(tooltipText) === 'string' ? tooltipText : ReactDOMServer.renderToStaticMarkup(tooltipText);
    return id || sha1(text);
  }

  renderBeacon() {
    const { inactive, hashCheck } = this.state;
    if (inactive || (hashCheck === HASH_CHECK_PENDING) || (hashCheck === HASH_CHECK_FOUND)) {
      // If the beacon is inactive then don't render it.
      // Otherwise we need to wait until the hash is set before we render.
      // If it is never set, that means that the user has already
      // clicked on this beacon so we don't display it again.
      return Children.toArray(this.props.children)[0];
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

    const tooltipClass = tooltipActive ? 'tour-in' : (!this.state.tooltipHidden && 'tour-out') || 'inactive';

    const baseProps = {
      attachment: `${this.state.tooltipAttachmentVertical} ${this.state.tooltipAttachmentHorizontal}`,
      classes: { target: 'tether-target-tooltip' },
      constraints: [{ to: 'scrollParent' }],
      offset: this.getTooltipOffset()
    };

    const tetherProps = tooltipActive ? { ...baseProps } : { ...baseProps, enabled: false };
    return (this.state.tooltipAttachmentVertical &&
      <TetherComponent {...tetherProps}>
        {this.props.children}
        <tour-tooltip class={tooltipClass} ref="tooltip">
          {this.props.tooltipText}
          <tour-tooltip-arrow ref="tooltipArrow" style={this.state.arrowPosition} />
        </tour-tooltip>
      </TetherComponent>
    );
  }

  render() {
    if (!this.state.tooltip) {
      return this.renderBeacon();
    } else {
      return this.renderTooltip();
    }
  }

  loadHash(persistent) {
    if (persistent) {
      this.context.beacon.loadHash(this.getHash(), found => {
        const hashCheck = found ? HASH_CHECK_FOUND : HASH_CHECK_NOT_FOUND;
        if (hashCheck !== this.state.hashCheck) {
          this.setState({ hashCheck });
        }
      });
    } else {
      this.setState({ hashCheck: HASH_CHECK_NOT_PERSISTENT });
    }
  }

  checkHashStatus() {
    if (this.state.persistent) {
      const cachedHash = this.context.beacon.checkHash(this.getHash());
      if (cachedHash === false) {
        return HASH_CHECK_PENDING;
      } else if (cachedHash === null) {
        return HASH_CHECK_NOT_FOUND;
      } else {
        return HASH_CHECK_FOUND;
      }
    } else {
      return HASH_CHECK_NOT_PERSISTENT;
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
    if (this.state.persistent) {
      this.context.beacon.storeHash(this.getHash());
    }
  }
}

export default withClickOutside(Beacon);
export const BeaconConfig = Config;
