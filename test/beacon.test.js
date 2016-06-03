import './init-globals';
import React from 'react';
import expect from 'expect.js';
import { mount } from 'enzyme';
import { spy } from 'sinon';
import TestUtils from 'react-addons-test-utils';
import { Beacon } from '../src/Beacon';
import Portal from 'react-portal';

const portalSpy = spy(Portal.prototype, 'componentDidMount');
function portal() { return portalSpy.lastCall.thisValue.node.firstChild; }

describe('<Beacon />', () => {
  let wrapper;

  spy(Beacon.prototype, 'componentDidMount');

  beforeEach(() => {
    const parent = document.createElement('div');
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
    expect(portal().tagName).to.equal('TOUR-TOOLTIP');
  });
});
