import React from 'react';
import ReactDOM from 'react-dom';
import Beacon from '../src/Beacon';
import BeaconConfig from '../src/BeaconConfig';

function renderBlock(id) {
  return (
    <div style={{
      height: '100px',
      width: '100px',
      margin: '10px',
      position: 'relative',
      left: '100px',
      backgroundColor: 'red'
    }}>
      <div className="blue" style={{
        width: '50px',
        height: '25px',
        margin: '0 0 0 25px'
      }}>{id}</div>
    </div>
  );
}

class TestChild extends React.Component { // eslint-disable-line react/no-multi-comp
  render() { return renderBlock('beacon_1'); }
}

class Test extends React.Component { // eslint-disable-line react/no-multi-comp
  render() {
    return (
      <BeaconConfig>
        <h1>Simple Beacons</h1>
        <Beacon tooltipText="This is a tooltip">
          <TestChild />
        </Beacon>
        <Beacon tooltipText="This is a tooltip 2">
          {renderBlock('beacon_2')}
        </Beacon>
        <Beacon tooltipText="This is a tooltip 3">
          {renderBlock('beacon_3')}
        </Beacon>
        <Beacon tooltipText="This is a tooltip">
          {renderBlock('beacon_4')}
        </Beacon>
      </BeaconConfig>
    );
  }
}

const reactRoot = document.getElementById('app-root');
ReactDOM.render(<Test/>, reactRoot);
