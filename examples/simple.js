import React from 'react';
import ReactDOM from 'react-dom';
import Beacon from 'react-beacon';

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
    return (<div id={id} style={style}>{id}</div>);
  }

  render() {
    return (<div>
      <h1>Beacon Example</h1>
      {this.renderBlock('heading_left')}
      {this.renderBlock('heading_right')}
      {this.renderBlock('heading_top')}
      {this.renderBlock('heading_bottom')}
      <Beacon parent="#heading_left" position="left">
        <tour-tooltip>This is a tooltip</tour-tooltip>
      </Beacon>
      <Beacon parent="#heading_right" position="right">
        <tour-tooltip>This is a tooltip</tour-tooltip>
      </Beacon>
      <Beacon parent="#heading_top" position="top">
        <tour-tooltip>This is a tooltip</tour-tooltip>
      </Beacon>
      <Beacon parent="#heading_bottom" position="bottom">
        <tour-tooltip>This is a tooltip</tour-tooltip>
      </Beacon>
    </div>);
  }
}

ReactDOM.render(<Test/>, document.getElementById('__react-content'));
