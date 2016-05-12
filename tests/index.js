import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect.js';
import Beacon from '../index';

describe('<Beacon />', () => {
  const div = document.createElement('div');
  document.body.insertBefore(div, document.body.firstChild);

  beforeEach(() => {
    ReactDOM.render(
      <div>
        <span id="foo" />
        <Beacon parent="#foo" position="left" >Tooltip</Beacon>
      </div>, div
    );
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
  });

  it('renders a beacon when mounted', () => {
    expect(document.getElementsByTagName('tour-beacon').length).to.equal(1);
    expect(document.querySelector('.ToolTipPortal span')).to.be(null);
  });

  it('shows a tooltip when the beacon is clicked', () => {
    const beacon = document.getElementsByTagName('tour-beacon')[0];
    beacon.click();
    expect(document.getElementsByTagName('tour-beacon').length).to.equal(0);
    expect(document.querySelector('.ToolTipPortal span')).not.to.be(null);
  });
});
