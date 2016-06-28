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
      <h1>Beacon Example</h1>
      <Beacon tooltipText="This is a left tooltip" position="middle left">
        {this.renderBlock('heading_left')}
      </Beacon>
      <Beacon tooltipText="This is a right tooltip" position="middle right">
        {this.renderBlock('heading_right')}
      </Beacon>
      <Beacon tooltipText="This is a top tooltip" position="top center">
        {this.renderBlock('heading_top')}
      </Beacon>
      <Beacon tooltipText="This is a bottom tooltip" position="bottom center">
        {this.renderBlock('heading_bottom')}
      </Beacon>
    </div>);
  }
}

const reactRoot = document.getElementById('app-root');
ReactDOM.render(<Test/>, reactRoot);
