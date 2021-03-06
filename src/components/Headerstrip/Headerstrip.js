import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Transition } from 'react-spring'

import css from './Headerstrip.css'

const moment = require('moment')

class Headerstrip extends Component {
  static propTypes = {
    className: PropTypes.string,
    id: PropTypes.string,
    onAccept: PropTypes.func,
    onDismiss: PropTypes.func,
    onSnooze: PropTypes.func,
    showDismiss: PropTypes.bool,
    showSnooze: PropTypes.bool,
    texts: PropTypes.objectOf(PropTypes.string),
    title: PropTypes.string,
  }

  static defaultProps = {
    title: 'Placeholder title',
    showDismiss: true,
    showSnooze: true,
    texts: {
      accept: 'Accept',
      dismiss: 'Dismiss',
      remind_me_later: 'Snooze',
    },
  }

  constructor(props) {
    super(props)
    this.state = {
      status: localStorage.getItem(this.statusKey()),
    }
  }

  statusKey() {
    return `${this.props.id}-status`
  }

  actionKey() {
    return `${this.props.id}-action-at`
  }

  onAccept = event => {
    event.preventDefault()
    if (typeof this.props.onAccept === 'function') {
      this.props.onAccept()
    }
    this.setStorage('accepted')
  }

  onDismiss = event => {
    event.preventDefault()
    if (typeof this.props.onDismiss === 'function') {
      this.props.onDismiss()
    }
    this.setStorage('dismissed')
  }

  onSnooze = event => {
    event.preventDefault()
    if (typeof this.props.onSnooze === 'function') {
      this.props.onSnooze()
    }
    this.setStorage('snoozed')
  }

  setStorage = status => {
    localStorage.setItem(this.statusKey(), status)
    localStorage.setItem(this.actionKey(), moment().format('YYYY-MM-DD'))
    this.setState({ status })
  }

  shouldDisplay() {
    const { id } = this.props
    const { status } = this.state
    const actionAt = moment(localStorage.getItem(`${id}-action-at`)).add(
      1,
      'days'
    )
    const snoozed = status === 'snoozed'
    const dismissed = status === 'dismissed'
    const accepted = status === 'accepted'
    const daysBetweenSnooze = moment().diff(actionAt, 'days')

    if (dismissed || accepted) {
      return false
    }

    if (snoozed && daysBetweenSnooze < 1) {
      return false
    }

    return true
  }

  render() {
    const { className, title, texts, id, showDismiss, showSnooze } = this.props
    const shouldHide = !id || !this.shouldDisplay()

    const HeaderstripBar = (
      <div className={classNames(css.headerstrip, className)}>
        <div className={classNames(css['headerstrip-title'])}>{title}</div>
        <div className={classNames(css['headerstrip-options'])}>
          {showDismiss && (
            <div
              className={classNames(css['headerstrip-option'])}
              role="button"
              tabIndex={0}
              onClick={this.onDismiss}
              onKeyPress={this.onDismiss}
            >
              {texts.dismiss || 'Dismiss'}
            </div>
          )}
          {showSnooze && (
            <div
              className={classNames(css['headerstrip-option'])}
              role="button"
              tabIndex={0}
              onClick={this.onSnooze}
              onKeyPress={this.onSnooze}
            >
              {texts.remind_me_later || 'Remind me later'}
            </div>
          )}
          <div
            className={classNames(
              css['headerstrip-option'],
              css['headerstrip-rounded-option']
            )}
            role="button"
            tabIndex={0}
            onClick={this.onAccept}
            onKeyPress={this.onAccept}
          >
            {texts.accept || 'Accept'}
          </div>
        </div>
      </div>
    )

    return (
      <Transition
        from={{ opacity: 0, height: 0 }}
        enter={{ opacity: 1, height: 'auto' }}
        leave={{ opacity: 0, height: 0 }}
      >
        {!shouldHide && (styles => <div style={styles}>{HeaderstripBar}</div>)}
      </Transition>
    )
  }
}

export default Headerstrip
