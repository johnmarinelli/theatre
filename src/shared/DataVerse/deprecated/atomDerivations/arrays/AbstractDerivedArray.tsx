import Emitter from '$shared/DataVerse/utils/Emitter'
import {PointerDerivation} from '$shared/DataVerse/deprecated/atomDerivations/pointer'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import Tappable from '$shared/DataVerse/utils/Tappable'
import {PropOfADD} from '$shared/DataVerse/deprecated/atomDerivations/dicts/AbstractDerivedDict'

let lastId: number = 0

interface IDerivedArrayChangeType {
  startIndex: number
  deleteCount: number
  addCount: number
}

type IndexOfAbstractDerivedArray<V> = PropOfADD<V>

export default abstract class AbstractDerivedArray<V> {
  isDerivedArray = true
  readonly _id: number
  _trace: $IntentionalAny
  readonly _changeEmitter: Emitter<IDerivedArrayChangeType>
  _changeEmitterHasTappers: boolean
  abstract _reactToHavingTappers(): void
  abstract _reactToNotHavingTappers(): void
  _pointer: undefined | PointerDerivation<AbstractDerivedArray<V>>
  abstract index(i: number): AbstractDerivation<IndexOfAbstractDerivedArray<V>>
  abstract length(): number

  constructor() {
    if ($env.KEEPING_DERIVATION_TRACES === true) {
      this._trace = new Error('trace')
    }
    this._id = lastId++
    this._changeEmitter = new Emitter()
    this._changeEmitterHasTappers = false
    this._changeEmitter.onNumberOfTappersChange(() => {
      this._reactToNumberOfChangeTappersChange()
    })
  }

  _reactToNumberOfChangeTappersChange() {
    const hasTappers = this._changeEmitter.hasTappers()
    if (hasTappers === this._changeEmitterHasTappers) return
    this._changeEmitterHasTappers = hasTappers
    if (hasTappers) {
      this._reactToHavingTappers()
    } else {
      this._reactToNotHavingTappers()
    }
  }

  changes(): Tappable<IDerivedArrayChangeType> {
    return this._changeEmitter.tappable
  }

  pointer(): PointerDerivation<this> {
    if (!this._pointer) {
      this._pointer = pointer.default({type: 'WithPath', root: this, path: []})
    }
    // @ts-ignore
    return this._pointer
  }

  concat(right: AbstractDerivedArray<V>): AbstractDerivedArray<V> {
    return concatDerivedArray.default(this, right)
  }

  reduce<
    Acc,
    Fn extends ((acc: Acc, v: V, n: number) => Acc | AbstractDerivation<Acc>),
    Seed extends Acc | AbstractDerivation<Acc>
  >(fn: Fn, seed: Seed): AbstractDerivation<Acc> {
    return reduceDerivedArray.default(this, fn, seed)
  }

  map<T, Fn extends ((d: AbstractDerivation<V>) => T)>(
    fn: Fn,
  ): AbstractDerivedArray<T> {
    return mapDerivedArray.default(this, fn)
  }

  toJS(): AbstractDerivation<Array<V>> {
    return this.reduce((acc, cur) => [...acc, cur], [])
  }
}

const pointer = require('$shared/DataVerse/deprecated/atomDerivations/pointer')
const concatDerivedArray = require('./concatDerivedArray')
const reduceDerivedArray = require('./reduceDerivedArray')
const mapDerivedArray = require('./mapDerivedArray')