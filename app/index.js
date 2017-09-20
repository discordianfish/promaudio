import { h, render, Component } from 'preact';
import Player from './player';
import 'purecss';
import './css/style.css';

const Logo =
    require('./logo.png?sizes[]=350,sizes[]=500,sizes[]=800');

class App extends Component {
  constructor() {
    super();
  }

  render(props, state) {
    return <div id="app">
      <img style={{width: '100%'}} srcSet={Logo.srcSet} src={Logo.src}/>
      <h1>Promaudio Player</h1>
      <p>Enter a expression and click Play!</p>
      <p>This creates a oscillator for each timeseries which is tuned every <i>Sample Duration</i> seconds to a frequency relative to the metrics value.</p>
      <a href="https://github.com/discordianfish/promaudio"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://camo.githubusercontent.com/a6677b08c955af8400f44c6298f40e7d19cc5b2d/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677261795f3664366436642e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png" /></a>
      <Player />
    </div>;
  }
}

render(<App />, document.body);
