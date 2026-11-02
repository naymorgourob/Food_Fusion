import { useRef, useState } from 'react'
import { useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'

const TILT_DEGREES = 7
const PARALLAX_PX = 14
const HOVER_TURN_DEGREES = 50

/**
 * Shared interaction state for menu cards: the card tilts toward the
 * cursor, its media floats (parallax) and turns on hover, and adding to
 * the cart fires a "+1" burst plus an extra turn. Mouse-only, and off
 * entirely for reduced-motion users.
 */
export function useDishCardMotion({ dish, quantity, onAdd, onSetQuantity }) {
  const reduceMotion = useReducedMotion()
  const burstId = useRef(0)
  const [bursts, setBursts] = useState([])

  // Pointer position over the card, -0.5..0.5 on each axis.
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const spring = { stiffness: 180, damping: 18 }
  const rotateX = useSpring(
    useTransform(pointerY, [-0.5, 0.5], [TILT_DEGREES, -TILT_DEGREES]),
    spring,
  )
  const rotateY = useSpring(
    useTransform(pointerX, [-0.5, 0.5], [-TILT_DEGREES, TILT_DEGREES]),
    spring,
  )
  const mediaX = useSpring(useTransform(pointerX, [-0.5, 0.5], [-PARALLAX_PX, PARALLAX_PX]), spring)
  const mediaY = useSpring(useTransform(pointerY, [-0.5, 0.5], [-PARALLAX_PX, PARALLAX_PX]), spring)
  const turn = useSpring(0, { stiffness: 60, damping: 14 })

  const cardProps = {
    onPointerMove(event) {
      if (reduceMotion || event.pointerType !== 'mouse') return
      const rect = event.currentTarget.getBoundingClientRect()
      pointerX.set((event.clientX - rect.left) / rect.width - 0.5)
      pointerY.set((event.clientY - rect.top) / rect.height - 0.5)
    },
    onPointerEnter() {
      if (!reduceMotion) turn.set(HOVER_TURN_DEGREES)
    },
    onPointerLeave() {
      pointerX.set(0)
      pointerY.set(0)
      turn.set(0)
    },
    style: { rotateX, rotateY, transformPerspective: 900 },
  }

  function celebrate() {
    const id = ++burstId.current
    setBursts((current) => [...current, id])
    setTimeout(() => setBursts((current) => current.filter((burst) => burst !== id)), 700)
    turn.set(turn.get() + 120)
  }

  function add() {
    onAdd(dish)
    celebrate()
  }

  function changeQuantity(next) {
    if (onSetQuantity) onSetQuantity(dish.id, next, dish)
    else if (next > quantity) onAdd(dish)
    if (next > quantity) celebrate()
  }

  return { cardProps, mediaStyle: { x: mediaX, y: mediaY }, turn, bursts, add, changeQuantity }
}
