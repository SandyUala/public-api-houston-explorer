import React, { Component } from 'react';
import logo from './satellite.png';
import './App.css';

import './graphiql.css';

import GraphiQL from 'graphiql';
import fetch from 'isomorphic-fetch';
import classNames from 'classnames';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      authorization: localStorage.getItem('token-1') || '',
      organization: '',
      username: '',
      password: '',
      error: '',
      activeAPI: 1,
      APIs: ["http://localhost:14000/v1", "http://houston.staging.astronomer.io/v1", "https://houston.astronomer.io/v1", "https://cli.astronomer.io/v1"]
    }
  }
  graphQLFetcher = (graphQLParams) => {
    return fetch(this.state.APIs[this.state.activeAPI], {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'authorization': this.state.authorization,
        'organization': this.state.organization
      },
      body: JSON.stringify(graphQLParams),
    }).then(response => response.json());
  }
  changeAPIconnection = (val) => {
    if (this.state.activeAPI !== val) {
      this.setState({ activeAPI: val, authorization: localStorage.getItem(`token-${val}`) || '' });
    }
  }
  login(e) {
    const { username, password } = this.state;
    return fetch(this.state.APIs[this.state.activeAPI], {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: `
        mutation createToken {
          createToken(username: "${username}", password: "${password}") {
            success
            message
            token
          }
        }
      `}),
    }).then(response => {
      const resp = response.json();
      resp.then(({ data: { createToken: { success, message, token }} }) => {
        if (!success) return this.setState({ error: message });
        localStorage.setItem(`token-${this.state.activeAPI}`, token)
        this.setState({ authorization: token });
      });
    });
  }
  logout() {
    this.state.APIs.forEach((api, i) => localStorage.setItem(`token-${i}`, ''));
    this.setState({ authorization: '', username: '', password: '', organization: '' });
  }
  updateHeader = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    this.setState({[name]: value});
  }
  render() {
    let Explorer = <p>Loading...</p>
    if (this.state.APIs) {
      Explorer = <GraphiQL fetcher={this.graphQLFetcher.bind(this)} />;
    }
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Houston - Ground Control</h2>
          <p>Welcome to the interactive explorer console for the Astronomer Public GraphQL API</p>
          <p style={{wordWrap: "break-word"}}>
            <b>API</b>: {this.state.APIs[this.state.activeAPI]} <br />
            <b>TOKEN</b>: {this.state.authorization} <br />
            <b>ORG</b>: {this.state.organization} <br />
          </p>

          <div className="api-switch">
            <hr />
            <button
              onClick={this.changeAPIconnection.bind(this, 0)}
              className={classNames({active:this.state.activeAPI === 0})}
                >Local</button>
            <button
              onClick={this.changeAPIconnection.bind(this, 1)}
              className={classNames({active:this.state.activeAPI === 1})}
                >Staging</button>
            <button
              onClick={this.changeAPIconnection.bind(this, 2)}
              className={classNames({active:this.state.activeAPI === 2})}
                >Prod</button>
            <button
              onClick={this.changeAPIconnection.bind(this, 3)}
              className={classNames({active:this.state.activeAPI === 3})}
                >Pro</button>
          </div>
          <div>
            <div style={{padding: "20px 0 0"}}>
                <label>Username: <input name="username" value={this.state.username} onChange={this.updateHeader.bind(this)} /></label>
            </div>
            <div style={{padding: "20px 0"}}>
                <label>Password: <input name="password" type="password" value={this.state.password} onChange={this.updateHeader.bind(this)} /></label>
            </div>
            {this.state.error ?
              <div className={classNames('error')}>{this.state.error}</div> : null
            }
            <button
              onClick={this.logout.bind(this)}
              className={classNames('logout')}
                >Logout
            </button>
            <button
              onClick={this.login.bind(this)}
              className={classNames('login')}
                >Login
            </button>
          </div>
          <div>
            <div style={{padding: "20px 0 0"}}>
              <label>Token: <input name="authorization" value={this.state.authorization} onChange={this.updateHeader.bind(this)}/></label>
            </div>
            <div style={{padding: "20px 0"}}>
              <label>Org ID: <input name="organization" value={this.state.organization} onChange={this.updateHeader.bind(this)} /></label>
            </div>
        </div>
    </div>
    <div style={{height: "100vh"}}>
        {Explorer}
    </div>
    </div>
    );
  }
}

export default App;
