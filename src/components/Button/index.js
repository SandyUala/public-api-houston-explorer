import React, { Component } from 'react';

import classNames from 'classnames';
import s from './index.module.css';

export default class Button extends Component {
    // constructor(props) {
    //     super(props);
    // }

    render() {
        return (
            <span className={classNames('button-wrapper')}>
                <button
                    className={classNames("button", this.props.className)}
                    onClick={this.props.onClick}
                >{this.props.children}</button>
            </span>
        );
    }
}