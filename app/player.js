import {h, Component} from 'preact';
import linkState from 'linkstate';

const defaultURL = 'http://demo.robustperception.io:9090';
const sampleRate = 44100;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const gain = audioCtx.createGain();
gain.connect(audioCtx.destination);

const oscTypes = ['sine', 'square', 'sawtooth', 'triangle'];

export default class Player extends Component {
  constructor() {
    super();
    this.state = {
      url: defaultURL,
      query: 'go_goroutines',
      frame: 0,
      end: Date.now()/1000,
      range: 3600,
      sampleCount: 1000,
      sampleDuration: 0.1,
      volume: 50,
      oscType: '<random>',
    };
    this.submit = this.submit.bind(this);
    this.tune = this.tune.bind(this);
    this.stop = this.stop.bind(this);
  }

  tune() {
    let i = -1;
    this.state.samples.map((series) => {
      i++;
      if (this.state.frame >= series.values.length) {
        clearTimeout(this.clock);
        this.state.oscs[i].stop();
        return;
      }

      const ratio = (series.values[this.state.frame][1]/this.state.maxVal);
      const freq = (ratio * sampleRate/2);
      // console.log("freq", freq)

      this.state.oscs[i].frequency.value = freq; //  - (sampleRate/2)
    });
  }
  stop(e) {
    e.preventDefault();
    clearTimeout(this.clock);
    this.state.oscs.map((osc) => {
 osc.stop();
});
    this.state.oscs = null;
  }
  submit(e) {
    e.preventDefault();
    this.query(this.state.query)
      .then((res) => {
        let maxVal = 0;
        let oscs = [];
        res.data.result.map((series) => {
          const oscType = this.state.oscType == '<random>' ?
            oscTypes[Math.floor(Math.random()*oscTypes.length)] :
            this.state.oscType;
          let osc = audioCtx.createOscillator();
          osc.type = oscType;
          osc.frequency.value = 440;
          osc.connect(gain);
          osc.start();
          oscs.push(osc);

          series.values.map((val) => {
            const v = parseInt(val[1]);
            if (v > maxVal) {
              maxVal = v;
            }
          });
        });

        this.setState({
          samples: res.data.result,
          oscs: oscs,
          frame: 0,
          maxVal: maxVal,
        });
        this.clock = setInterval(() => {
          this.setState({frame: this.state.frame+1});
          this.tune();
        }, this.state.sampleDuration*1000);
      })
      .catch((err) => this.setState({error: err}));
  }
  query(query) {
    const params = new URLSearchParams(Object.entries({
      query: query,
      start: this.state.end - this.state.range,
      end: this.state.end,
      step: this.state.range / this.state.sampleCount,
    }));

    return fetch(this.state.url + '/api/v1/query_range?' + params.toString(), {
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

  getResults() {
    if (this.state.error) {
      return <div className='error'>{this.state.error.message}</div>;
    }
    let results = [];
    let scheme = window.location.protocol;
    if (
      scheme == 'https:' &&
      this.state.url.indexOf(scheme) != 0) {
      results.push(<div className='error'>When using the HTTPS site, you need to
        specify a HTTPS Prometheus URL</div>);
    }
    if (this.state.samples && this.state.samples.length > 0) {
      results.push(<pre>{JSON.stringify(this.state.samples, null, 2)}</pre>);
    }
    return results;
  }

  render(props, state) {
    let results = this.getResults();
    let oscTypeOptions = ['<random>', ...oscTypes].map((o) => {
 return (<option>{o}</option>);
});
    return <div>
      <form onSubmit={this.submit} className='pure-form'>
        <div className='pure-g'>
          <div className='pure-u-3-5'>
            <textarea style={{width: '100%', height: '10em'}}
              className='pure-input-2-3' id='query' name='query'
              value={this.state.query} onInput={linkState(this, 'query')} />
            <div>Play frame #{this.state.frame} / {this.state.sampleCount}</div>
            <div className='results'>{results}</div>
          </div>
          <div className='pure-u-2-5'>
            <fieldset>
              <div style={{marginBottom: '1em'}}>
                <button className='pure-button' type='submit'>&#9654;</button>
                <button className='pure-button' onClick={this.stop}>&#9632;
                </button>
              </div>
              <label className='volume'>
                &#128266;
                <input type='range' value={this.state.volume} onInput={(e) => {
                  this.setState({volume: e.target.value});
                  gain.gain.value = e.target.value / 100;
                }} />
              </label>
              <label>Prometheus URL
                <input type='text' placeholder='Prometheus URL'
                  value={this.state.url} onInput={linkState(this, 'url')} />
              </label>
              <label>End date
                <input type='text' placeholder='End date'
                  value={this.state.end} onInput={linkState(this, 'end')} />
              </label>
              <label>Range (seconds)
                <input type='text' placeholder='Range (seconds)'
                  value={this.state.range} onInput={linkState(this, 'range')} />
              </label>
              <label>Number of samples
                <input type='text' placeholder='Number of samples'
                  value={this.state.sampleCount}
                  onInput={linkState(this, 'sampleCount')} />
              </label>
              <label>Sample Duration
                <input type='text' placeholder='Sample duration'
                  value={this.state.sampleDuration}
                  onInput={linkState(this, 'sampleDuration')} />
              </label>
              <label>Oscillator type
                <select onInput={linkState(this, 'oscType')}>
                  {oscTypeOptions}
                </select>
              </label>
            </fieldset>
          </div>
        </div>
      </form>
    </div>;
  }
}
