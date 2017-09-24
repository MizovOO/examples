import {Observable} from 'rxjs'
import jss from 'jss'

const renderBox = () => {
  const box = document.createElement('div')
  box.textContent = 'Drag me'
  return box
}

const getPosition = (box) => {
  // Create event streams. Note no event listeners are created at this point.
  const mousedown$ = Observable.fromEvent(box, 'mousedown')
  const mousemove$ = Observable.fromEvent(box.ownerDocument, 'mousemove')
  const mouseup$ = Observable.fromEvent(box, 'mouseup')

  // Now mousedown event listener will be created.
  return mousedown$.switchMap((md) => {
    const startX = md.clientX + window.scrollX
    const startY = md.clientY + window.scrollY
    const style = getComputedStyle(md.target)
    const startLeft = parseInt(style.left, 10) || 0
    const startTop = parseInt(style.top, 10) || 0

    // Now mousemove event listener is will be created.
    return mousemove$
      // Convert the event to object to a position object.
      .map(mm => ({
        left: startLeft + mm.clientX - startX,
        top: startTop + mm.clientY - startY
      }))
      // As soon as mouseup event occurs, mousemove listener will be removed.
      .takeUntil(mouseup$)
  })
}

const renderStyles = (pos$) => {
  // Create the style sheet.
  const {classes} = jss.createStyleSheet({
    box: {
      position: 'absolute',
      width: '100px',
      height: '100px',
      background: 'black',
      color: 'white',
      cursor: 'move',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      top: pos$.map(({top}) => `${top}px`),
      left: pos$.map(({left}) => `${left}px`)
    }
  // Use option `link: true` in order to connect CSSStyleRule with the JSS StyleRule.
  }, {link: true}).attach()

  return classes.box
}

const mount = () => {
  const box = renderBox()
  const pos$ = getPosition(box)
  box.className = renderStyles(pos$)
  document.body.appendChild(box)
}

mount()