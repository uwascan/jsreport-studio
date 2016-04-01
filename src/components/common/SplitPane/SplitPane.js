import React from 'react'
import ReactDOM from 'react-dom'
import Pane from './Pane'
import Resizer from './Resizer'

export default React.createClass({

  propTypes: {
    primary: React.PropTypes.oneOf([ 'first', 'second' ]),
    minSize: React.PropTypes.number,
    defaultSize: React.PropTypes.object,
    size: React.PropTypes.number,
    allowResize: React.PropTypes.bool,
    resizerClassName: React.PropTypes.string,
    split: React.PropTypes.oneOf([ 'vertical', 'horizontal' ]),
    onDragStarted: React.PropTypes.func,
    onDragFinished: React.PropTypes.func
  },

  getInitialState () {
    return {
      active: false,
      resized: false
    }
  },

  getDefaultProps () {
    return {
      split: 'vertical',
      minSize: 50,
      allowResize: true,
      primary: 'first'
    }
  },

  componentDidMount () {
    this.setSize(this.props, this.state)
    document.addEventListener('mouseup', this.onMouseUp)
    document.addEventListener('mousemove', this.onMouseMove)
  },

  componentWillReceiveProps (props) {
    this.setSize(props, this.state)
  },

  setSize (props, state) {
    const ref = this.props.primary === 'first' ? this.refs.pane1 : this.refs.pane2
    let newSize
    if (ref) {
      newSize = props.size || (state && state.draggedSize) || props.defaultSize || props.minSize
      ref.setState({
        size: newSize
      })
    }
  },

  componentWillUnmount () {
    document.removeEventListener('mouseup', this.onMouseUp)
    document.removeEventListener('mousemove', this.onMouseMove)
  },

  onMouseDown (event) {
    if (this.props.allowResize && !this.props.size) {
      this.unFocus()
      let position = this.props.split === 'vertical' ? event.clientX : event.clientY
      if (typeof this.props.onDragStarted === 'function') {
        this.props.onDragStarted()
      }
      this.setState({
        active: true,
        position: position
      })
    }
  },

  onMouseMove (event) {
    if (this.props.allowResize && !this.props.size) {
      if (this.state.active) {
        this.unFocus()
        const ref = this.props.primary === 'first' ? this.refs.pane1 : this.refs.pane2
        if (ref) {
          const node = ReactDOM.findDOMNode(ref)

          if (node.getBoundingClientRect) {
            const width = node.getBoundingClientRect().width
            const height = node.getBoundingClientRect().height
            const current = this.props.split === 'vertical' ? event.clientX : event.clientY
            const size = this.props.split === 'vertical' ? width : height
            const position = this.state.position
            const newPosition = this.props.primary === 'first' ? (position - current) : (current - position)

            let newSize = size - newPosition

            if (newSize < this.props.minSize) {
              newSize = this.props.minSize
            } else {
              this.setState({
                position: current,
                resized: true
              })
            }

            if (this.props.onChange) {
              this.props.onChange(newSize)
            }
            this.setState({
              draggedSize: newSize
            })
            ref.setState({
              size: newSize
            })
          }
        }
      }
    }
  },

  onMouseUp () {
    if (this.props.allowResize && !this.props.size) {
      if (this.state.active) {
        if (typeof this.props.onDragFinished === 'function') {
          this.props.onDragFinished()
        }
        this.setState({
          active: false
        })
      }
    }
  },

  unFocus () {
    if (document.selection) {
      document.selection.empty()
    } else {
      window.getSelection().removeAllRanges()
    }
  },

  merge: function (into, obj) {
    for (let attr in obj) {
      into[ attr ] = obj[ attr ]
    }
  },

  render () {
    const {split, allowResize, resizerClassName} = this.props
    let disabledClass = allowResize ? '' : 'disabled'

    let style = {
      display: 'flex',
      flex: 1,
      outline: 'none',
      overflow: 'hidden',
      MozUserSelect: 'text',
      WebkitUserSelect: 'text',
      msUserSelect: 'text',
      userSelect: 'text'
    }

    if (split === 'vertical') {
      this.merge(style, {
        flexDirection: 'row'
      })
    } else {
      this.merge(style, {
        flexDirection: 'column',
        height: '100%',
        minHeight: '100%',
        width: '100%'
      })
    }

    const children = this.props.children
    const classes = [ 'SplitPane', this.props.className, split, disabledClass ]

    return (
      <div className={classes.join(' ')} style={style} ref='splitPane'>
        <Pane ref='pane1' key='pane1' className='Pane1' split={split}>{children[ 0 ]}</Pane>
        <Resizer ref='resizer' key='resizer' className={disabledClass + ' ' + resizerClassName} onMouseDown={this.onMouseDown} split={split}/>
        <Pane ref='pane2' key='pane2' className='Pane2' split={split}>{children[ 1 ]}</Pane>
      </div>
    )
  }
})