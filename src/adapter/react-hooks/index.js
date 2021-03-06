import React, { useState, useEffect } from 'react'
import uniqid from 'uniqid'
import forEachObjIndexed from 'ramda/src/forEachObjIndexed'

import skulletor from '../../skulletor'
import { applyBaseCSS, applyAnimation } from '../../middlewares'
import applyFadeOut from './middlewares/fadeOut'

import createCSSAnimation from '../../helpers/createCSSAnimation'
import injectStyleToHead from '../../helpers/injectStyleToHead'

export function adapter() {
  let globalStyles = {}

  function transform(cssObject) {
    const { animationRules, animationId } = createCSSAnimation(cssObject)

    if (animationRules && animationId) {
      globalStyles[animationId] = animationRules
    }

    return (
      <div key={uniqid()} style={cssObject.skeleton}>
        <div style={cssObject.skeleton['&:after']} />
      </div>
    )
  }

  function finish(done) {
    if (typeof window !== undefined) {
      globalStyles &&
        forEachObjIndexed((_value, id) => {
          const styleTag = document.getElementById(id)
          styleTag.parentNode.removeChild(styleTag)
        }, globalStyles)
    }
    done && done()
  }

  function render(skeletonArray, finish) {
    const Skulletor = ({ end, onDisapear, ...others }) => {
      const [onAir, setOnAir] = useState(true)
      useEffect(() => {
        globalStyles && forEachObjIndexed(injectStyleToHead, globalStyles)
      }, [])

      useEffect(() => {
        if (end && onAir) {
          if (finish && typeof finish === 'function') {
            finish(() => {
              typeof onDisapear === 'function' && onDisapear()
              setOnAir(false)
            })
          } else {
            setOnAir(false)
          }
        }
      }, [end])

      return onAir && <div {...{ ...others }}>{skeletonArray}</div>
    }

    return { Skulletor }
  }

  return { transform, finish, render }
}

function skulletorTool(shapes, middlewares = []) {
  return skulletor(shapes, middlewares, adapter())
}

export const skulletorFactory = (middlewares = []) => (shapes) => skulletorTool(shapes, middlewares)

export default (shapes) => {
  const defaultMiddlewares = [applyBaseCSS(), applyAnimation(), applyFadeOut()]
  return skulletorTool(shapes, defaultMiddlewares)
}
