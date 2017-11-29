import React, { Component } from 'react';

import classNames from 'classnames';
import s from './index.module.css';

export default class TextField extends Component {
    render() {
        const props = this.props;
        return (
            <span className={classNames("textfield")}>
                <input
                    {...props}
                    className={classNames("input")}
                />
            </span>
        );
    }
}