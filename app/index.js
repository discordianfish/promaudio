import { h, render, Component } from 'preact';
import Player from './player';
import 'purecss';
import './css/style.css';

class App extends Component {
  constructor() {
    super();
  }

  render(props, state) {
    return <div>
      <h1>Promaudio Player</h1>
      <Player />
    </div>;
  }
}

render(<App />, document.body);
