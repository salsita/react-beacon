import React, { Component, Children, PropTypes } from 'react';
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

function deepCloneNode(node, parent, fn) {
  const clone = fn(node, parent);
  const childNodes = Array.prototype.slice.call(node.childNodes);
  childNodes.forEach(childNode => deepCloneNode(childNode, clone, fn));
  return clone;
}

export class Beacon extends Component {

  static propTypes = {
    active: PropTypes.bool,
    persistent: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
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
      tooltipAttachment: null,
      appRoot: null,
      appRootClassName: ''
    };
  }

  componentWillMount() {
    const inactive = (this.props.active === false) || (this.context.beacon && (this.context.beacon.active === false));
    const persistent = this.props.persistent || (this.context.beacon && this.context.beacon.persistent);
    const indexedDB = (this.context.beacon && this.context.beacon.indexedDB) || window.indexedDB;
    this.setState({ inactive, persistent, indexedDB });

    this.checkHash();
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

  componentWillUpdate() {
    this.checkHash();

    // If margins are similar then center tooltip
    if (this.state.targetBounds) {
      const verticalAttachment = this.getVerticalAttachment(this.state.targetBounds);
      const horizontalAttachment = this.getHorizontalAttachment(this.state.targetBounds);
      const tooltipAttachment = `${verticalAttachment} ${horizontalAttachment}`;
      if (this.state.tooltipAttachment !== tooltipAttachment) {
        this.setState({ tooltipAttachment });
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
  }

  getVerticalAttachment(bounds) {
    const marginBottom = window.innerHeight - bounds.bottom;
    const marginTop = bounds.top;
    if (marginBottom < marginTop) {
      return 'bottom';
    } else {
      return 'top';
    }
  }

  getHorizontalAttachment(bounds) {
    const marginRight = window.innerWidth - bounds.right;
    const marginLeft = bounds.left;
    if (Math.abs(marginRight - marginLeft) < TOOLTIP_TOLERANCE) {
      return 'center';
    } else if (marginRight < marginLeft) {
      return 'right';
    } else {
      return 'left';
    }
  }

  getTooltipOffset() {
    switch (this.state.tooltipAttachment) {
    case 'top left': return '0 28px';
    case 'top right': return '0 -28px';
    case 'bottom left': return '0 28px';
    case 'bottom right': return '0 -28px';
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

  renderBeacon(persistent) {
    if (this.state.inactive || (persistent && !this.state.hash)) {
      // We need to wait until the hash is set before we render.
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

    const tooltipClass = tooltipActive ? 'tour-in' : !this.state.tooltipHidden && 'tour-out';
    const baseProps = {
      attachment: this.state.tooltipAttachment,
      classes: { target: 'tether-target-tooltip' },
      constraints: [{ to: 'scrollParent' }],
      offset: this.getTooltipOffset()
    };
    const tetherProps = tooltipActive ? { ...baseProps } : { ...baseProps, enabled: false };
    return (this.state.tooltipAttachment &&
      <TetherComponent {...tetherProps}>
        {this.props.children}
        <tour-tooltip class={tooltipClass} ref="tooltip">
          {this.props.tooltipText}
        </tour-tooltip>
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

  loadHash(persistent) {
    const hash = persistent === true ? sha1(JSON.stringify(this.props.tooltipText)) : persistent;

    const transaction = this.state.database.transaction(['beacons']);
    const objectStore = transaction.objectStore('beacons');
    objectStore.get(hash).onsuccess = (event) => {
      if (!event.target.result) {
        if (!this.state.hash) {
          this.setState({ hash });
        }
      } else {
        if (this.state.hash) {
          this.setState({ hash: null });
        }
      }
    };
  }

  checkHash() {
    const persistent = this.state.persistent;
    if (persistent) {
      // Retrieve the state of the badge from the database
      // If `persistent` is `true` then we use the hash of the component's children
      // as a unique ID. `persistent` can be set to some other truthy value to override this default ID.
      if (!this.state.database) {
        const request = indexedDB.open('react-beacon');
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          db.createObjectStore('beacons');
        };
        request.onsuccess = () => {
          if (!this.state.database) {
            this.setState({ database: request.result });
          }
          this.loadHash(persistent);
        };
      } else {
        this.loadHash(persistent);
      }
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
