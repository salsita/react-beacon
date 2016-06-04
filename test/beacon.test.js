import React from 'react';
import expect from 'expect.js';
import { mount } from 'enzyme';
import { spy } from 'sinon';
import TestUtils from 'react-addons-test-utils';
import { Beacon } from '../src/Beacon';
import Portal from 'react-portal';

function waitsFor(conditionFunc, maxTime = 2000, interval = 100) {
  return new Promise((resolve, reject) => {
    function waitForTimeout(timeout, currentTime, maxTime) {
      setTimeout(() => {
        if (conditionFunc()) {
          resolve();
        } else if (currentTime + timeout > maxTime) {
          // Took more than maximum time
          reject();
        } else {
          waitForTimeout(timeout, currentTime + timeout, maxTime);
        }
      }, timeout);
    }
    waitForTimeout(interval, 0, maxTime);
  });
}

let portalSpy;
function portal() { return portalSpy.lastCall.thisValue.node.firstChild; }

before(() => {
  spy(Beacon.prototype, 'componentDidMount');
  portalSpy = spy(Portal.prototype, 'componentDidMount');
});

after(() => {
  Beacon.prototype.componentDidMount.restore();
  Portal.prototype.componentDidMount.restore();
  portalSpy = null;
})

describe('<Beacon />', () => {
  let wrapper;
  let parent;

  beforeEach(() => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
    wrapper = mount(<Beacon/>, { attachTo: parent });
  });

  afterEach(() => {
    wrapper.detach();
    document.body.removeChild(document.body.firstChild);
  });

  it('renders a beacon when mounted', () => {
    expect(Beacon.prototype.componentDidMount.calledOnce).to.equal(true);
    expect(wrapper.state('parentEl')).not.to.be.null;
    expect(wrapper.state('tooltip')).to.be(false);
    expect(portal().tagName).to.equal('TOUR-BEACON');
  });

  it('shows a tooltip when the beacon is clicked', () => {
    TestUtils.Simulate.click(portal());
    expect(wrapper.state('tooltip')).to.be(true);
    expect(wrapper.state('tooltipActive')).to.be(true);
    expect(parent.className).to.equal('');
    expect(portal().tagName).to.equal('TOUR-TOOLTIP');
  });

  it('hides the tooltip when the user clicks anywhere on the page', () => {
    TestUtils.Simulate.click(portal());
    wrapper.instance().handleClickOutside({ preventDefault: () => {}});
    expect(wrapper.state('tooltip')).to.be(true);
    expect(wrapper.state('tooltipActive')).to.be(false);
  });

  it('fades the app root background when "tour-overlay" class is set', (done) => {
    parent.className = 'tour-overlay';
    const wrapper2 = mount(<Beacon/>, { attachTo: parent });
    TestUtils.Simulate.click(portal());
    expect(parent.className).to.equal('tour-faded tour-overlay');
    wrapper2.instance().handleClickOutside({ preventDefault: () => {}});
    expect(parent.className).to.equal('tour-overlay');
    wrapper2.detach();
    // We need to wait for the clone to fade out and be removed
    waitsFor(() => !document.getElementById('tour-target-clone')).then(done);
  });

  it('clones the tooltip target when "tour-overlay" class is set', () => {
    parent.className = 'tour-overlay';
    const wrapper2 = mount(<Beacon/>, { attachTo: parent });
    expect(document.getElementById('tour-target-clone')).to.be(null);
    TestUtils.Simulate.click(portal());
    expect(document.getElementById('tour-target-clone')).not.to.be(null);
    wrapper2.detach();
  });
});
