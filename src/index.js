import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './static/foundation.min.css';
import './static/foundation-overrides.css';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
