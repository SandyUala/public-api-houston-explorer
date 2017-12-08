import React, { Component } from 'react';
import logo from './satellite.png';
import './App.css';

import './graphiql.css';

import { Button, Header, TextField } from './components';

import { split, execute } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { parse } from 'graphql';
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
      activeAPI: 0,
      APIs: window.APIs || [{label:"local", http: "http://localhost:14000/v1", ws: "ws://localhost:14000/w1"}]
    }
  }
  graphQLFetcher = (graphQLParams) => {

    const httpLink = new HttpLink({
      uri: this.state.APIs[this.state.activeAPI].http,
      headers: {
        "Authorization": this.state.authorization,
        "organization": this.state.organization
      }
    });

    const wsLink = new WebSocketLink({
      uri: this.state.APIs[this.state.activeAPI].ws,
      options: {
        reconnect: false
      }
    });

    const link = split(
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
      },
      wsLink,
      httpLink,
    );

    const fetcher = (operation) => {
      operation.query = parse(operation.query);
      return execute(link, operation);
    };

    return fetcher(graphQLParams);
  }
  changeAPIconnection = (val) => {
    if (this.state.activeAPI !== val) {
      this.setState({ activeAPI: val, authorization: localStorage.getItem(`token-${val}`) || '' });
    }
  }
  login(e) {
    const { username, password } = this.state;
    return fetch(this.state.APIs[this.state.activeAPI].http, {
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
        this.setState({ authorization: token, error: '' });
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
        <Header>
          <h2 className='filmotype'>Houston - Ground Control</h2>
          <p className='filmotype'>Welcome to the interactive explorer console for the Astronomer Public GraphQL API</p>
          <p style={{wordWrap: "break-word"}}>
            <b>API</b>: {this.state.APIs[this.state.activeAPI].uri} <br />
            <b>TOKEN</b>: {this.state.authorization} <br />
            <b>ORG</b>: {this.state.organization} <br />
          </p>
          <hr />
          <div className="api-switch section-wrapper">
            {this.state.APIs.map((API, i) => (
              <Button key={`api${i}`}
                onClick={this.changeAPIconnection.bind(this, i)}
                className={classNames({ active: this.state.activeAPI === i })}
              >
                {API.label}
              </Button>
            ))}
          </div>
          <div className="section-wrapper">
            <div>
                <TextField placeholder="Username" name="username" type="text" value={this.state.username} onChange={this.updateHeader.bind(this)} />
            </div>
            <div style={{padding: "20px 0"}}>
                <TextField placeholder="Password" name="password" type="password" value={this.state.password} onChange={this.updateHeader.bind(this)} />
            </div>
            {this.state.error ?
              <div className={classNames('error')}>{this.state.error}</div> : null
            }
            <Button
              onClick={this.logout.bind(this)}
              className={classNames('logout')}
                >Logout
            </Button>
            <Button
              onClick={this.login.bind(this)}
              className={classNames('login')}
                >Login
            </Button>
          </div>
          <div className="section-wrapper">
            <div>
              <label>Token: <input name="authorization" value={this.state.authorization} onChange={this.updateHeader.bind(this)}/></label>
            </div>
            <div style={{padding: "20px 0 0 0"}}>
              <label>Org ID: <input name="organization" value={this.state.organization} onChange={this.updateHeader.bind(this)} /></label>
            </div>
        </div>
      </Header>
      <div style={{height: "100vh"}}>
          {Explorer}
      </div>
    </div>
    );
  }
}

export default App;
