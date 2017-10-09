import React, { Component } from 'react';

import classNames from 'classnames';
import s from './index.module.css';

export default class Header extends Component {
    render() {
        return (
            <div className="header">
                {this.props.children}
            </div>
        );
    }
}