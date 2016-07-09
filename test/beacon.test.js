import React from 'react';
import expect from 'expect.js';
import { mount } from 'enzyme';
import { spy, stub } from 'sinon';
import TestUtils from 'react-addons-test-utils';
import { Beacon, BeaconConfig } from '../src/Beacon';

function waitsFor(conditionFunc, maxTime = 2000, interval = 100) {
  return new Promise((resolve, reject) => {
    function wait(timeout, current, max) {
      setTimeout(() => {
        if (conditionFunc()) {
          resolve();
        } else if (current + timeout > max) {
          // Took more than maximum time
          reject();
        } else {
          wait(timeout, current + timeout, max);
        }
      }, timeout);
    }
    wait(interval, 0, maxTime);
  });
}

before(() => {
  spy(Beacon.prototype, 'componentWillMount');
});

after(() => {
  Beacon.prototype.componentWillMount.restore();
});

describe('<Beacon />', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(<Beacon tooltipText="tooltip"><div id="foo" /></Beacon>);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders a beacon when mounted', () => {
    expect(Beacon.prototype.componentWillMount.calledOnce).to.equal(true);
    expect(wrapper.state('tooltip')).to.be(false);
    expect(wrapper.state('persistent')).to.be(undefined);
    expect(wrapper.ref('beacon').type()).to.equal('tour-beacon');
  });

  it('shows a tooltip when the beacon is clicked', () => {
    wrapper.ref('beacon').simulate('click');
    expect(wrapper.state('tooltip')).to.be(true);
    expect(wrapper.state('tooltipActive')).to.be(true);
    expect(wrapper.ref('tooltip').type()).to.equal('tour-tooltip');
  });

  it('hides the tooltip when the user clicks anywhere on the page', () => {
    wrapper.ref('beacon').simulate('click');
    wrapper.instance().handleClickOutside({ preventDefault: () => {}});
    expect(wrapper.state('tooltip')).to.be(true);
    expect(wrapper.state('tooltipActive')).to.be(false);
  });

  it('fades the app root background when "tour-overlay" class is set', (done) => {
    document.body.className = 'tour-overlay';
    const wrapper2 = mount(<Beacon tooltipText="tooltip"><div id="bar" /></Beacon>);
    wrapper2.ref('beacon').simulate('click');
    expect(document.body.className).to.equal('tour-faded tour-overlay');
    wrapper2.instance().handleClickOutside({ preventDefault: () => {}});
    expect(document.body.className).to.equal('tour-overlay');
    wrapper2.unmount();
    document.body.className = '';
    // We need to wait for the clone to fade out and be removed
    waitsFor(() => !document.getElementById('tour-target-clone')).then(done);
  });

  it('clones the tooltip target when "tour-overlay" class is set', () => {
    document.body.className = 'tour-overlay';
    const wrapper2 = mount(<Beacon tooltipText="tooltip"><div id="bar" /></Beacon>);
    expect(document.getElementById('tour-target-clone')).to.be(null);
    wrapper2.ref('beacon').simulate('click');
    expect(document.getElementById('tour-target-clone')).not.to.be(null);
    wrapper2.unmount();
  });
});

describe('Context', () => {
  let wrapper;
  const open = stub().returns({});
  const mockIndexedDB = { open };
  const config = mount(<BeaconConfig persistent indexedDB={mockIndexedDB} />);

  beforeEach(() => {
    wrapper = mount(<Beacon tooltipText="some text"><div id="foo" /></Beacon>, {
      context: config.instance().getChildContext()
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('overrides the default values with the context if any', () => {
    expect(wrapper.state('persistent')).to.be(true);
    expect(open.calledOnce).to.equal(true);
  });
});
