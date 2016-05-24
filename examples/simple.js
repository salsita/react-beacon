import React from 'react';
import ReactDOM from 'react-dom';
import Beacon from 'react-beacon';

class Test extends React.Component {
  renderBlock(id, child) {
    const style = {
      height: '100px',
      width: '100px',
      margin: '10px',
      position: 'relative',
      left: '200px',
      backgroundColor: 'red'
    };
    return (<div style={style}>{id}{child}</div>);
  }

  render() {
    return (<div>
      <h1>Beacon Example</h1>
      {this.renderBlock('heading_left', (
        <Beacon position="left" appRoot="__react-content">
          This is a tooltip
        </Beacon>
      ))}
      {this.renderBlock('heading_right', (
        <Beacon position="right" appRoot="__react-content">
          This is a tooltip
        </Beacon>
      ))}
      {this.renderBlock('heading_top', (
        <Beacon position="top" appRoot="__react-content">
          This is a tooltip
        </Beacon>
      ))}
      {this.renderBlock('heading_bottom', (
        <Beacon position="bottom" appRoot="__react-content">
          This is a tooltip
        </Beacon>
      ))}
    </div>);
  }
}

ReactDOM.render(<Test/>, document.getElementById('__react-content'));
