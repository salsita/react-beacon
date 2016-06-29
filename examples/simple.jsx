import React from 'react';
import ReactDOM from 'react-dom';
import Beacon from '../src/Beacon';

function renderBlock(id) {
  const style = {
    height: '100px',
    width: '100px',
    margin: '10px',
    position: 'relative',
    left: '10px',
    backgroundColor: 'red'
  };
  return (<div style={style}>{id}</div>);
}

class TestChild extends React.Component { // eslint-disable-line react/no-multi-comp
  render() { return renderBlock('beacon_1'); }
}

class Test extends React.Component { // eslint-disable-line react/no-multi-comp
  render() {
    return (<div>
      <h1>Simple Beacons</h1>
      <Beacon tooltipText="This is a tooltip">
        <TestChild />
      </Beacon>
      <Beacon persistent tooltipText="This is a tooltip">
        {renderBlock('beacon_2')}
      </Beacon>
      <Beacon tooltipText="This is a tooltip">
        {renderBlock('beacon_3')}
      </Beacon>
      <Beacon tooltipText="This is a tooltip">
        {renderBlock('beacon_4')}
      </Beacon>
    </div>);
  }
}

const reactRoot = document.getElementById('app-root');
ReactDOM.render(<Test/>, reactRoot);
