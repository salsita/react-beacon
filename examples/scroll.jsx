import React from 'react';
import ReactDOM from 'react-dom';
import Beacon from '../src/Beacon';

class Test extends React.Component {
  renderBlock(id) {
    const style = {
      height: '100px',
      width: '100px',
      margin: '10px',
      position: 'relative',
      left: '200px',
      backgroundColor: 'red'
    };
    return (<div style={style}>{id}</div>);
  }

  render() {
    return (<div>
      <h1>Scrolling Beacons</h1>
      <Beacon tooltipText="This is a tooltip">
        {this.renderBlock('beacon_1')}
      </Beacon>
      <Beacon tooltipText="This is a tooltip">
        {this.renderBlock('beacon_2')}
      </Beacon>
      <Beacon tooltipText="This is a tooltip">
        {this.renderBlock('beacon_3')}
      </Beacon>
      <Beacon tooltipText="This is a tooltip">
        {this.renderBlock('beacon_4')}
      </Beacon>
    </div>);
  }
}

const reactRoot = document.getElementById('app-root');
ReactDOM.render(<Test/>, reactRoot);
