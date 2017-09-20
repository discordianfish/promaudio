import { h, Component } from 'preact';

const url = "http://localhost:42401";
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const sampleRate = 44100;

export default class Player extends Component {
  constructor() {
    super();
    this.state = {
      query: 'avg by (instance) (probe_http_duration_seconds)',
      frame: 0,
    }
    this.submit = this.submit.bind(this);
    this.tune = this.tune.bind(this);
  }

  tune() {
    let i = -1
    this.state.samples.map((series) => {
      i++
      if (this.state.frame >= series.values.length) {
        this.clock = null;
        this.state.oscs[i].stop()
        return
      }
      const freq = series.values[this.state.frame][1] * 10000;
      console.log("tuning", i, "to", freq)

      this.state.oscs[i].frequency.value = freq
    });
  }
  submit(e) {
    e.preventDefault();
    this.query(this.state.query)
      .then((res) => {
        var oscs = [];
        for (var series in res.data.result) {
          var osc = audioCtx.createOscillator();
          osc.frequency.value = 440;
          osc.connect(audioCtx.destination);
          osc.start();
          oscs.push(osc)
        }

        this.setState({
          samples: res.data.result,
          oscs: oscs,
          frame: 0,
        })
        this.clock = setInterval(() => {
          this.setState({frame: this.state.frame+1});
          this.tune();
        }, 100)
      })
      .catch((err) => this.setState({error: err}));
  }
  query(query) {
    const now = Date.now() / 1000
    const params = new URLSearchParams(Object.entries({
      query: query,
      start: now - 3600,
      end: now,
      step: 30,
    }));

  	return fetch(url + '/api/v1/query_range?' + params.toString(), {
      method: 'GET',
    })
    .then((resp) => {
      if (resp.ok) {
        return resp.json();
      }
      return resp.json().then((json) => {
        let error = new Error(json.errorType + ': ' + json.error);
        throw error;
      });
    });
  }

  render(props, state) {
    let error;
    if (this.state.error) {
      error = <div className="error">{this.state.error.message}</div>
    }
    return <div>
      {error}
      <form onSubmit={this.submit}>
        <label>
          <input type="text" id="query" name="query" value={this.state.query} onChange={
            (e) => { this.setState({query: e.target.value})} }/>
          Query
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>;
  }
}
